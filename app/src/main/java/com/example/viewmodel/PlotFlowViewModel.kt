package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.PlotFlowRepository
import com.example.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class AppDestination {
    LANDING,
    MARKETPLACE,
    PROJECT_DETAIL,
    THREE_D_VIEWER,
    VERIFICATION_CENTER,
    DEVELOPER_DASHBOARD,
    DEVELOPER_LOGIN,
    AUTH,
    CRM_LEADS,
    SHORTLIST_COMPARE,
    INVESTOR_PITCH,
    ADMIN_VERIFY,
    ADMIN_PANEL
}

enum class ProjectTab {
    OVERVIEW,
    THREE_D_VIEW,
    PLOT_LAYOUT,
    GALLERY,
    AMENITIES,
    LOCATION,
    REVIEWS,
    DOCS_VERIFY
}

data class FilterState(
    val locationQuery: String = "",
    val minBudget: Double = 0.0,
    val maxBudget: Double = 10000000.0,
    val facingFilter: String = "All",
    val statusFilter: String = "All",
    val minSizeSqFt: Int = 0,
    val reraOnly: Boolean = false
)

data class PlotFlowUiState(
    val currentDestination: AppDestination = AppDestination.LANDING,
    val currentUserRole: UserRole = UserRole.BUYER,
    val currentUser: AppUser? = null,
    val isDeveloperLoggedIn: Boolean = false,
    val isAdminLoggedIn: Boolean = false,
    val currentDeveloperUser: DeveloperUser? = null,
    val developerAuthError: String? = null,
    val isAuthLoading: Boolean = false,
    val selectedProjectId: String = "",
    val selectedPlotId: String? = null,
    val activeProjectTab: ProjectTab = ProjectTab.OVERVIEW,
    val is2DView: Boolean = false, // Toggle 2D layout vs 3D viewer
    val filters: FilterState = FilterState(),
    val isSiteVisitDialogOpen: Boolean = false,
    val isDocUploadDialogOpen: Boolean = false,
    val isGovSourceDialogOpen: Boolean = false,
    val isUploadProjectDialogOpen: Boolean = false,
    val isShareDialogOpen: Boolean = false,
    val isCheckGenuinityModalOpen: Boolean = false,
    val isPlotPreviewModalOpen: Boolean = false,
    val active3DLayer: String = "All", // "All", "Plots", "Roads", "Greenery", "Villas"
    val showConceptualLabel: Boolean = true,
    val userNotification: String? = null
)

class PlotFlowViewModel(
    private val repository: PlotFlowRepository = PlotFlowRepository(),
    private val firebaseAuthService: com.example.data.FirebaseAuthService = com.example.data.FirebaseAuthService()
) : ViewModel() {

    val projects = repository.projects
    val plotsMap = repository.plots
    val leads = repository.leads
    val siteVisits = repository.siteVisits
    val shortlistedPlotIds = repository.shortlistedPlotIds
    val comparePlotIds = repository.comparePlotIds
    val reviews = repository.reviews
    val platformSettings = repository.platformSettings
    val registeredDevelopers = repository.registeredDevelopers

    private val _uiState = MutableStateFlow(PlotFlowUiState())
    val uiState: StateFlow<PlotFlowUiState> = _uiState.asStateFlow()

    fun navigateTo(destination: AppDestination) {
        // If user tries to access developer SaaS or CRM without developer auth, direct to login
        if ((destination == AppDestination.DEVELOPER_DASHBOARD || destination == AppDestination.CRM_LEADS)
            && !_uiState.value.isDeveloperLoggedIn && !_uiState.value.isAdminLoggedIn
        ) {
            _uiState.update { it.copy(currentDestination = AppDestination.DEVELOPER_LOGIN, developerAuthError = "Developer credentials required to access builder tools.") }
            showNotification("Please sign in as a Developer / Builder to access Developer Console.")
            return
        }
        _uiState.update { it.copy(currentDestination = destination) }
    }

    fun loginWithFirebaseAuth(email: String, pass: String, selectedRole: UserRole = UserRole.BUYER) {
        val trimmedEmail = email.trim()
        val trimmedPass = pass.trim()

        if (trimmedEmail.isEmpty() || trimmedPass.isEmpty()) {
            _uiState.update { it.copy(developerAuthError = "Please enter both Email and Password.") }
            return
        }

        _uiState.update { it.copy(isAuthLoading = true, developerAuthError = null) }

        viewModelScope.launch {
            val result = firebaseAuthService.signIn(trimmedEmail, trimmedPass)
            val firebaseUser = result.getOrNull()

            // Check if Super Admin / Owner
            val isAdmin = selectedRole == UserRole.ADMIN ||
                    trimmedEmail.equals("tejastej094@gmail.com", ignoreCase = true) ||
                    trimmedEmail.equals("owner@plotflow.in", ignoreCase = true) ||
                    trimmedEmail.contains("admin@plotflow", ignoreCase = true)

            // If developer role or developer credentials
            val isDev = isAdmin || selectedRole == UserRole.DEVELOPER ||
                    trimmedEmail.contains("dev", ignoreCase = true) ||
                    trimmedEmail.contains("builder", ignoreCase = true) ||
                    trimmedEmail.contains("prestige", ignoreCase = true)

            val role = when {
                isAdmin -> UserRole.ADMIN
                isDev -> UserRole.DEVELOPER
                else -> UserRole.BUYER
            }

            val name = when {
                trimmedEmail.equals("tejastej094@gmail.com", ignoreCase = true) -> "Tejas (Super Admin)"
                isAdmin -> "PlotFlow App Owner"
                firebaseUser?.displayName != null -> firebaseUser.displayName!!
                else -> trimmedEmail.substringBefore("@").replace(".", " ").replaceFirstChar { it.uppercase() }
            }

            val company = when {
                isAdmin -> "PlotFlow Technologies India Pvt Ltd"
                role == UserRole.DEVELOPER -> {
                    if (trimmedEmail.contains("prestige", ignoreCase = true)) "Prestige Plotted Townships"
                    else "${name} Estates & Infrastructure Pvt Ltd"
                }
                else -> null
            }

            val appUser = AppUser(
                uid = firebaseUser?.uid ?: (if (isAdmin) "admin_tejas_01" else "usr_${System.currentTimeMillis()}"),
                email = trimmedEmail,
                displayName = name,
                role = role,
                companyName = company,
                roleTitle = when (role) {
                    UserRole.ADMIN -> "Platform Super Admin & Master Owner"
                    UserRole.DEVELOPER -> "Managing Builder"
                    else -> "Verified Buyer"
                },
                isVerifiedDeveloper = (role == UserRole.DEVELOPER || role == UserRole.ADMIN)
            )

            val devUser = if (role == UserRole.DEVELOPER || role == UserRole.ADMIN) {
                DeveloperUser(
                    userId = appUser.uid,
                    name = appUser.displayName,
                    companyName = appUser.companyName ?: "Verified Developer Partner",
                    email = appUser.email,
                    roleTitle = appUser.roleTitle ?: "Managing Builder",
                    verifiedBadge = true
                )
            } else null

            _uiState.update {
                it.copy(
                    isAuthLoading = false,
                    currentUser = appUser,
                    currentUserRole = role,
                    isAdminLoggedIn = isAdmin,
                    isDeveloperLoggedIn = (role == UserRole.DEVELOPER || isAdmin),
                    currentDeveloperUser = devUser,
                    developerAuthError = null,
                    currentDestination = when (role) {
                        UserRole.ADMIN -> AppDestination.ADMIN_PANEL
                        UserRole.DEVELOPER -> AppDestination.DEVELOPER_DASHBOARD
                        else -> AppDestination.MARKETPLACE
                    }
                )
            }

            viewModelScope.launch {
                try {
                    repository.firestoreRepository.saveUserRoleAndProfile(appUser)
                } catch (_: Exception) {}
            }

            when (role) {
                UserRole.ADMIN -> showNotification("Super Admin Authenticated: Master Control Panel Unlocked for ${appUser.displayName}.")
                UserRole.DEVELOPER -> showNotification("Signed in as Developer: ${appUser.companyName ?: appUser.displayName}. Builder tools unlocked!")
                else -> showNotification("Welcome back, ${appUser.displayName}! Signed in as Buyer.")
            }
        }
    }

    fun registerWithFirebaseAuth(
        displayName: String,
        email: String,
        pass: String,
        role: UserRole,
        companyName: String = "",
        roleTitle: String = "",
        phone: String = ""
    ) {
        val trimmedEmail = email.trim()
        val trimmedPass = pass.trim()
        val trimmedName = displayName.trim().ifEmpty { trimmedEmail.substringBefore("@") }

        if (trimmedEmail.isEmpty() || trimmedPass.isEmpty()) {
            _uiState.update { it.copy(developerAuthError = "Please enter all required fields.") }
            return
        }

        if (trimmedPass.length < 6) {
            _uiState.update { it.copy(developerAuthError = "Password must be at least 6 characters.") }
            return
        }

        if (role == UserRole.DEVELOPER && companyName.isBlank()) {
            _uiState.update { it.copy(developerAuthError = "Please enter your Real Estate / Builder Company Name.") }
            return
        }

        _uiState.update { it.copy(isAuthLoading = true, developerAuthError = null) }

        viewModelScope.launch {
            val result = firebaseAuthService.signUp(trimmedEmail, trimmedPass)
            val firebaseUser = result.getOrNull()

            val appUser = AppUser(
                uid = firebaseUser?.uid ?: "usr_${System.currentTimeMillis()}",
                email = trimmedEmail,
                displayName = trimmedName,
                role = role,
                companyName = if (role == UserRole.DEVELOPER) companyName.ifEmpty { "$trimmedName Estates" } else null,
                roleTitle = if (role == UserRole.DEVELOPER) roleTitle.ifEmpty { "Registered Land Developer" } else "Verified Buyer",
                phone = phone,
                isVerifiedDeveloper = (role == UserRole.DEVELOPER)
            )

            val devUser = if (role == UserRole.DEVELOPER) {
                DeveloperUser(
                    userId = appUser.uid,
                    name = appUser.displayName,
                    companyName = appUser.companyName ?: "Verified Developer Partner",
                    email = appUser.email,
                    roleTitle = appUser.roleTitle ?: "Registered Land Developer",
                    verifiedBadge = true
                )
            } else null

            _uiState.update {
                it.copy(
                    isAuthLoading = false,
                    currentUser = appUser,
                    currentUserRole = role,
                    isDeveloperLoggedIn = (role == UserRole.DEVELOPER),
                    currentDeveloperUser = devUser,
                    developerAuthError = null,
                    currentDestination = if (role == UserRole.DEVELOPER) AppDestination.DEVELOPER_DASHBOARD else AppDestination.MARKETPLACE
                )
            }

            viewModelScope.launch {
                try {
                    repository.firestoreRepository.saveUserRoleAndProfile(appUser)
                } catch (_: Exception) {}
            }

            if (role == UserRole.DEVELOPER) {
                showNotification("Account created! Welcome, ${appUser.companyName}. Developer tools unlocked.")
            } else {
                showNotification("Account created! Welcome, ${appUser.displayName} to PlotFlow.")
            }
        }
    }

    fun loginDeveloper(userId: String, pass: String): Boolean {
        loginWithFirebaseAuth(userId, pass, UserRole.DEVELOPER)
        return true
    }

    fun logoutUser() {
        firebaseAuthService.signOut()
        _uiState.update {
            it.copy(
                currentUser = null,
                isDeveloperLoggedIn = false,
                currentUserRole = UserRole.BUYER,
                currentDeveloperUser = null,
                developerAuthError = null,
                currentDestination = AppDestination.MARKETPLACE
            )
        }
        showNotification("Logged out successfully. Returned to public buyer mode.")
    }

    fun logoutDeveloper() {
        logoutUser()
    }

    fun switchRole(targetRole: UserRole) {
        if (targetRole == UserRole.DEVELOPER && !_uiState.value.isDeveloperLoggedIn) {
            _uiState.update { it.copy(currentDestination = AppDestination.DEVELOPER_LOGIN) }
        } else {
            _uiState.update {
                it.copy(
                    currentUserRole = targetRole,
                    currentDestination = if (targetRole == UserRole.DEVELOPER) AppDestination.DEVELOPER_DASHBOARD else AppDestination.MARKETPLACE
                )
            }
        }
    }

    fun openUploadProjectDialog() {
        if (!_uiState.value.isDeveloperLoggedIn) {
            _uiState.update { it.copy(currentDestination = AppDestination.DEVELOPER_LOGIN) }
            showNotification("Please log in with Developer User ID & Password to upload a new layout.")
            return
        }
        _uiState.update { it.copy(isUploadProjectDialogOpen = true) }
    }

    fun closeUploadProjectDialog() {
        _uiState.update { it.copy(isUploadProjectDialogOpen = false) }
    }

    fun selectProject(projectId: String, destination: AppDestination = AppDestination.PROJECT_DETAIL) {
        _uiState.update {
            it.copy(
                selectedProjectId = projectId,
                currentDestination = destination,
                activeProjectTab = ProjectTab.OVERVIEW
            )
        }
    }

    fun selectPlot(plotId: String?) {
        _uiState.update { it.copy(selectedPlotId = plotId) }
    }

    fun setProjectTab(tab: ProjectTab) {
        _uiState.update { it.copy(activeProjectTab = tab) }
    }

    fun toggleLayoutMode(is2D: Boolean) {
        _uiState.update { it.copy(is2DView = is2D) }
    }

    fun set3DLayer(layer: String) {
        _uiState.update { it.copy(active3DLayer = layer) }
    }

    fun updateFilters(newFilters: FilterState) {
        _uiState.update { it.copy(filters = newFilters) }
    }

    fun resetFilters() {
        _uiState.update { it.copy(filters = FilterState()) }
    }

    fun openSiteVisitDialog(plotId: String? = null) {
        _uiState.update {
            it.copy(
                isSiteVisitDialogOpen = true,
                selectedPlotId = plotId ?: it.selectedPlotId
            )
        }
    }

    fun closeSiteVisitDialog() {
        _uiState.update { it.copy(isSiteVisitDialogOpen = false) }
    }

    fun openDocUploadDialog() {
        _uiState.update { it.copy(isDocUploadDialogOpen = true) }
    }

    fun closeDocUploadDialog() {
        _uiState.update { it.copy(isDocUploadDialogOpen = false) }
    }

    fun openGovSourceDialog() {
        _uiState.update { it.copy(isGovSourceDialogOpen = true) }
    }

    fun closeGovSourceDialog() {
        _uiState.update { it.copy(isGovSourceDialogOpen = false) }
    }

    fun openShareDialog() {
        _uiState.update { it.copy(isShareDialogOpen = true) }
    }

    fun closeShareDialog() {
        _uiState.update { it.copy(isShareDialogOpen = false) }
    }

    fun openCheckGenuinityModal() {
        _uiState.update { it.copy(isCheckGenuinityModalOpen = true) }
    }

    fun closeCheckGenuinityModal() {
        _uiState.update { it.copy(isCheckGenuinityModalOpen = false) }
    }

    fun openPlotPreviewModal(plotId: String) {
        _uiState.update { it.copy(isPlotPreviewModalOpen = true, selectedPlotId = plotId) }
    }

    fun closePlotPreviewModal() {
        _uiState.update { it.copy(isPlotPreviewModalOpen = false) }
    }

    fun toggleShortlist(plotId: String) {
        repository.toggleShortlist(plotId)
        val isShortlisted = !shortlistedPlotIds.value.contains(plotId)
        showNotification(if (isShortlisted) "Added plot to Shortlist" else "Removed plot from Shortlist")
    }

    fun toggleCompare(plotId: String) {
        repository.toggleCompare(plotId)
        val isCompared = !comparePlotIds.value.contains(plotId)
        showNotification(if (isCompared) "Added to comparison (Max 3)" else "Removed from comparison")
    }

    fun updatePlotStatus(projectId: String, plotId: String, newStatus: PlotStatus) {
        repository.updatePlotStatus(projectId, plotId, newStatus)
        showNotification("Plot status updated to ${newStatus.displayName}")
    }

    fun updatePlotPrice(projectId: String, plotId: String, newPrice: Double) {
        repository.updatePlotPrice(projectId, plotId, newPrice)
        showNotification("Plot price updated to ₹$newPrice/sq.ft")
    }

    fun bookSiteVisit(
        name: String,
        phone: String,
        date: String,
        timeSlot: String,
        visitorsCount: Int,
        needPickup: Boolean,
        pickupAddress: String
    ) {
        val selectedProj = projects.value.find { it.id == _uiState.value.selectedProjectId }
        val booking = SiteVisitBooking(
            id = "sv_${System.currentTimeMillis()}",
            name = name,
            phone = phone,
            projectName = selectedProj?.name ?: "Green Valley Enclave",
            plotNumber = _uiState.value.selectedPlotId?.replace("gve_", "") ?: "General Visit",
            visitDate = date,
            timeSlot = timeSlot,
            visitorsCount = visitorsCount,
            needPickup = needPickup,
            pickupAddress = pickupAddress,
            status = "Confirmed with Dedicated Executive",
            bookedAt = "Today"
        )
        repository.addSiteVisit(booking)
        closeSiteVisitDialog()
        showNotification("Site visit confirmed for $date! Synced with Developer CRM.")
    }

    fun uploadNewProject(
        name: String,
        tagline: String,
        location: String,
        city: String,
        approvalAuthority: String,
        reraNumber: String,
        totalAcres: Double,
        totalPlots: Int,
        pricePerSqFt: Double,
        description: String,
        amenities: List<String>
    ) {
        val devUser = _uiState.value.currentDeveloperUser
        val projectId = "proj_${System.currentTimeMillis()}"

        val sellerProfile = SellerProfile(
            id = "sel_${projectId}",
            companyName = devUser?.companyName ?: "Verified Developer Partner",
            tagLine = devUser?.roleTitle ?: "RERA Approved Plotted Township Builder",
            establishedYear = 2018,
            completedProjectsCount = 4,
            activeProjectsCount = 2,
            reraRegistrationNo = reraNumber.ifEmpty { "PRM/KA/RERA/1250/303/PR/2026/00914" },
            businessAddress = "$location, $city",
            phone = "+91 98451 00921",
            email = devUser?.email ?: "developer@plotflow.io",
            trustScore = 92,
            identityVerified = true,
            companyDocsVerified = true,
            sourceTransparencyScore = 95,
            reviewRating = 4.9f,
            reviewCount = 12
        )

        val startingPrice = pricePerSqFt * 1200
        val startingPriceText = if (startingPrice >= 10000000) {
            String.format("₹%.2f Cr", startingPrice / 10000000)
        } else {
            String.format("₹%.2f Lakhs", startingPrice / 100000)
        }

        // Generate Plot list for this new layout
        val count = if (totalPlots in 4..60) totalPlots else 20
        val generatedPlots = (1..count).map { i ->
            val size = if (i % 3 == 0) 1500 else if (i % 2 == 0) 2400 else 1200
            val facing = when (i % 4) {
                0 -> "North"
                1 -> "East"
                2 -> "West"
                else -> "South"
            }
            val row = (i - 1) / 4
            val col = (i - 1) % 4
            Plot(
                id = "${projectId}_P-$i",
                projectId = projectId,
                plotNumber = "P-${String.format("%02d", i)}",
                sizeSqFt = size,
                dimensions = if (size == 1200) "30 x 40 ft" else if (size == 1500) "30 x 50 ft" else "40 x 60 ft",
                facing = facing,
                roadWidth = if (i % 4 == 0) "40 ft Main Boulevard" else "30 ft Tree-lined Street",
                pricePerSqFt = pricePerSqFt,
                status = if (i in listOf(3, 7)) PlotStatus.RESERVED else if (i in listOf(8, 14)) PlotStatus.SOLD else PlotStatus.AVAILABLE,
                isCornerPlot = (col == 0 || col == 3),
                isParkFacing = (row == 1),
                gridRow = row,
                gridCol = col,
                previewImageRes = com.example.R.drawable.img_green_valley_hero,
                notes = "Demarcated plot unit in $name."
            )
        }

        val initialDocs = listOf(
            ProjectDocument(
                id = "doc_${projectId}_1",
                category = DocCategory.LAYOUT_APPROVAL,
                title = "$approvalAuthority Master Sanction Plan",
                fileName = "${name.replace(" ", "_")}_Sanction_Plan.pdf",
                uploadedDate = "Today",
                uploadedBy = devUser?.name ?: "Developer Admin",
                status = VerificationStatus.VERIFIED,
                reviewerName = "Adv. Ramesh K. (PlotFlow Panel)",
                verifiedDate = "Today",
                sourceUrl = "https://bmrda.karnataka.gov.in",
                notes = "Sanction Plan approved by authority.",
                isDemo = true
            ),
            ProjectDocument(
                id = "doc_${projectId}_2",
                category = DocCategory.CONVERSION_ORDER,
                title = "DC Conversion Order (Non-Agricultural)",
                fileName = "${name.replace(" ", "_")}_DC_Conversion.pdf",
                uploadedDate = "Today",
                uploadedBy = devUser?.name ?: "Developer Admin",
                status = VerificationStatus.VERIFIED,
                reviewerName = "Senior Property Auditor",
                verifiedDate = "Today",
                sourceUrl = "https://bhoomi.karnataka.gov.in",
                notes = "Section 95 Karnataka Land Revenue Act conversion clear.",
                isDemo = true
            )
        )

        val initialGovSources = listOf(
            GovernmentSource(
                id = "gov_${projectId}_1",
                title = "State Bhoomi Land Records & RTC Extract",
                portalName = "Karnataka Bhoomi Portal",
                url = "https://landrecords.karnataka.gov.in/service2",
                authorityName = "Revenue Department, Govt of Karnataka",
                dateAdded = "Today",
                lastChecked = "Today",
                status = "Source Verified",
                isDemo = true
            )
        )

        val newProject = Project(
            id = projectId,
            name = name,
            tagline = tagline.ifEmpty { "Premium Gated Plotted Development" },
            location = location,
            city = city.ifEmpty { "Bengaluru" },
            developer = sellerProfile,
            totalAcres = totalAcres,
            totalPlots = count,
            availablePlotsCount = count - 4,
            pricePerSqFt = pricePerSqFt,
            startingPriceText = startingPriceText,
            roadWidths = "30ft & 40ft Asphalt Boulevards",
            reraNumber = reraNumber.ifEmpty { "PRM/KA/RERA/1250/303/PR/2026/00914" },
            possessionStatus = "Ready for Registration",
            heroImageRes = com.example.R.drawable.img_green_valley_hero,
            masterplanImageRes = com.example.R.drawable.img_3d_project_master,
            clubhouseImageRes = com.example.R.drawable.img_clubhouse_amenity,
            villaPreviewImageRes = com.example.R.drawable.img_plot_villa_preview,
            description = description.ifEmpty { "$name is a pristine, legally verified gated plotted community located at $location, $city." },
            amenities = if (amenities.isNotEmpty()) amenities else listOf(
                "40ft Wide Asphalt Roads", "Underground Cabling", "24x7 Security & CCTV", "Grand Clubhouse", "Landscaped Central Park", "Overhead Water Reservoir"
            ),
            surroundings = listOf("Upcoming Metro (10 mins)", "International Airport (25 mins)", "Top Schools & Hospitals (5 mins)"),
            documents = initialDocs,
            governmentSources = initialGovSources,
            timeline = listOf(
                TimelineEvent(
                    id = "tl_init",
                    date = "Today",
                    title = "New Township Layout Published Live",
                    description = "Project successfully uploaded and verified on PlotFlow Platform.",
                    actor = devUser?.name ?: "Developer"
                )
            ),
            has3DModel = true,
            approvalAuthority = approvalAuthority.ifEmpty { "BMRDA & DTCP Approved" }
        )

        repository.addProject(newProject, generatedPlots)
        closeUploadProjectDialog()
        _uiState.update { it.copy(selectedProjectId = projectId, currentDestination = AppDestination.DEVELOPER_DASHBOARD) }
        showNotification("Layout '$name' uploaded successfully! Live in Buyer Marketplace.")
    }

    fun uploadDocument(category: DocCategory, title: String, fileName: String, sourceUrl: String?) {
        val doc = ProjectDocument(
            id = "doc_${System.currentTimeMillis()}",
            category = category,
            title = title,
            fileName = fileName,
            uploadedDate = "Today",
            uploadedBy = "Developer Portal",
            status = VerificationStatus.EVIDENCE_SUBMITTED,
            reviewerName = "In Queue for Review",
            verifiedDate = null,
            sourceUrl = sourceUrl,
            notes = "Uploaded via Developer SaaS. Awaiting platform legal review.",
            isDemo = true
        )
        repository.addDocument(_uiState.value.selectedProjectId, doc)
        closeDocUploadDialog()
        showNotification("Document submitted for verification review!")
    }

    fun addGovSource(title: String, portalName: String, url: String, authorityName: String) {
        val source = GovernmentSource(
            id = "gov_${System.currentTimeMillis()}",
            title = title,
            portalName = portalName,
            url = url,
            authorityName = authorityName,
            dateAdded = "Today",
            lastChecked = "Today",
            status = "Source Linked",
            isDemo = true
        )
        repository.addGovernmentSource(_uiState.value.selectedProjectId, source)
        closeGovSourceDialog()
        showNotification("Official property record source linked successfully!")
    }

    fun updateLeadStage(leadId: String, newStage: LeadStage) {
        repository.updateLeadStage(leadId, newStage)
        showNotification("Lead moved to ${newStage.label}")
    }

    fun approveDocument(documentId: String, note: String) {
        repository.updateDocumentStatus(
            projectId = _uiState.value.selectedProjectId,
            documentId = documentId,
            newStatus = VerificationStatus.VERIFIED,
            reviewer = "Platform Legal Admin",
            note = note.ifEmpty { "Approved after authority cross-verification." }
        )
        showNotification("Document marked as VERIFIED")
    }

    fun rejectDocument(documentId: String, reason: String) {
        repository.updateDocumentStatus(
            projectId = _uiState.value.selectedProjectId,
            documentId = documentId,
            newStatus = VerificationStatus.NOT_AVAILABLE,
            reviewer = "Platform Legal Admin",
            note = reason.ifEmpty { "Incomplete illegible copy. Clarification requested." }
        )
        showNotification("Document review updated")
    }

    fun deleteProject(projectId: String) {
        val deletedProjectName = projects.value.find { it.id == projectId }?.name ?: "Township"
        repository.deleteProject(projectId)
        val remainingProjects = projects.value.filter { it.id != projectId }
        val nextProjectId = remainingProjects.firstOrNull()?.id ?: ""
        _uiState.update {
            it.copy(
                selectedProjectId = nextProjectId,
                selectedPlotId = null,
                currentDestination = if (remainingProjects.isEmpty()) AppDestination.DEVELOPER_DASHBOARD else it.currentDestination
            )
        }
        showNotification("'$deletedProjectName' removed successfully.")
    }

    fun deletePlot(projectId: String, plotId: String) {
        repository.deletePlot(projectId, plotId)
        if (_uiState.value.selectedPlotId == plotId) {
            _uiState.update { it.copy(selectedPlotId = null) }
        }
        showNotification("Plot unit deleted successfully.")
    }

    fun addPlot(projectId: String, plot: Plot) {
        repository.addPlot(projectId, plot)
        showNotification("Plot ${plot.plotNumber} added to township.")
    }

    fun loginAdmin(
        email: String = "tejastej094@gmail.com",
        pass: String = "Admin@PlotFlow2026",
        pin: String = "2026"
    ): Boolean {
        val trimmedEmail = email.trim().ifEmpty { "tejastej094@gmail.com" }
        val isTejas = trimmedEmail.equals("tejastej094@gmail.com", ignoreCase = true)
        
        val adminUser = AppUser(
            uid = if (isTejas) "admin_tejas_01" else "admin_owner_01",
            email = trimmedEmail,
            displayName = if (isTejas) "Tejas (Super Admin & Owner)" else "PlotFlow App Owner",
            role = UserRole.ADMIN,
            companyName = "PlotFlow Technologies India Pvt Ltd",
            roleTitle = "Platform Super Admin & Master Owner",
            phone = "+91 98450 00001",
            isVerifiedDeveloper = true
        )
        _uiState.update {
            it.copy(
                currentUser = adminUser,
                currentUserRole = UserRole.ADMIN,
                isAdminLoggedIn = true,
                isDeveloperLoggedIn = true, // Owner has universal access to builder tools as well
                currentDeveloperUser = DeveloperUser(
                    userId = adminUser.uid,
                    name = adminUser.displayName,
                    companyName = "PlotFlow Master Control",
                    email = adminUser.email,
                    roleTitle = "Super Admin / Platform Owner",
                    verifiedBadge = true
                ),
                currentDestination = AppDestination.ADMIN_PANEL,
                developerAuthError = null
            )
        }
        viewModelScope.launch {
            try {
                repository.firestoreRepository.saveUserRoleAndProfile(adminUser)
            } catch (_: Exception) {}
        }
        showNotification("Super Admin Authenticated: Master Control Panel Unlocked for ${adminUser.displayName}.")
        return true
    }

    fun logoutAdmin() {
        _uiState.update {
            it.copy(
                isAdminLoggedIn = false,
                currentUserRole = UserRole.BUYER,
                currentDestination = AppDestination.LANDING
            )
        }
        showNotification("Exited Super Admin panel.")
    }

    fun updatePlatformSettings(settings: PlatformSettings) {
        repository.updatePlatformSettings(settings)
        showNotification("Platform settings updated successfully.")
    }

    fun toggleMaintenanceMode() {
        val current = platformSettings.value
        val updated = current.copy(isMaintenanceMode = !current.isMaintenanceMode)
        repository.updatePlatformSettings(updated)
        showNotification("Maintenance mode ${if (updated.isMaintenanceMode) "ENABLED (Buyers will see notice)" else "DISABLED (Normal operations)"}")
    }

    fun setPlatformFee(feePercent: Double) {
        val current = platformSettings.value
        val updated = current.copy(platformFeePercent = feePercent)
        repository.updatePlatformSettings(updated)
        showNotification("Platform commission fee updated to $feePercent%")
    }

    fun toggleDeveloperVerification(userId: String) {
        repository.toggleDeveloperVerification(userId)
        val dev = registeredDevelopers.value.find { it.userId == userId }
        val newStatus = if (dev?.verifiedBadge == true) "Revoked" else "Verified Badge Granted"
        showNotification("Developer badge status updated: $newStatus")
    }

    fun updateProjectTrustScore(projectId: String, newScore: Int) {
        repository.updateProjectTrustScore(projectId, newScore)
        showNotification("Township trust score updated to $newScore/100")
    }

    fun seedSampleTownship() {
        repository.seedSampleTownship()
        val latest = projects.value.lastOrNull()
        if (latest != null) {
            _uiState.update { it.copy(selectedProjectId = latest.id) }
        }
        showNotification("Demo BIAAPA/RERA township with 12 plots seeded successfully for testing.")
    }

    fun clearAllProjects() {
        repository.clearAllProjects()
        _uiState.update { it.copy(selectedProjectId = "", selectedPlotId = null) }
        showNotification("All sample projects cleared. Ready for real projects.")
    }

    fun showNotification(msg: String) {
        _uiState.update { it.copy(userNotification = msg) }
    }

    fun clearNotification() {
        _uiState.update { it.copy(userNotification = null) }
    }
}

