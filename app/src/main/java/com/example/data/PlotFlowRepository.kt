package com.example.data

import com.example.R
import com.example.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class PlotFlowRepository(
    val firestoreRepository: FirestoreRepository = FirestoreRepository()
) {
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects.asStateFlow()

    private val _plots = MutableStateFlow<Map<String, List<Plot>>>(emptyMap())
    val plots: StateFlow<Map<String, List<Plot>>> = _plots.asStateFlow()

    private val _leads = MutableStateFlow<List<Lead>>(emptyList())
    val leads: StateFlow<List<Lead>> = _leads.asStateFlow()

    private val _siteVisits = MutableStateFlow<List<SiteVisitBooking>>(emptyList())
    val siteVisits: StateFlow<List<SiteVisitBooking>> = _siteVisits.asStateFlow()

    private val _shortlistedPlotIds = MutableStateFlow<Set<String>>(emptySet())
    val shortlistedPlotIds: StateFlow<Set<String>> = _shortlistedPlotIds.asStateFlow()

    private val _comparePlotIds = MutableStateFlow<Set<String>>(emptySet())
    val comparePlotIds: StateFlow<Set<String>> = _comparePlotIds.asStateFlow()

    private val _reviews = MutableStateFlow<List<ReviewItem>>(emptyList())
    val reviews: StateFlow<List<ReviewItem>> = _reviews.asStateFlow()

    private val _platformSettings = MutableStateFlow(PlatformSettings())
    val platformSettings: StateFlow<PlatformSettings> = _platformSettings.asStateFlow()

    private val _registeredDevelopers = MutableStateFlow<List<DeveloperUser>>(
        listOf(
            DeveloperUser(
                userId = "dev_gv_01",
                name = "Vikram Aditya",
                companyName = "Green Valley Infra Developers",
                email = "developer@greenvalley.in",
                roleTitle = "Managing Director",
                verifiedBadge = true
            ),
            DeveloperUser(
                userId = "dev_sk_02",
                name = "Rajesh Sharma",
                companyName = "Skyline Enclave Plots",
                email = "sharma@skylineinfra.com",
                roleTitle = "Founder & Chief Architect",
                verifiedBadge = true
            )
        )
    )
    val registeredDevelopers: StateFlow<List<DeveloperUser>> = _registeredDevelopers.asStateFlow()

    init {
        loadInitialData()
        loadCloudSettings()
    }

    private fun loadCloudSettings() {
        coroutineScope.launch {
            try {
                val cloudSettings = firestoreRepository.getPlatformSettings().getOrNull()
                if (cloudSettings != null) {
                    _platformSettings.value = cloudSettings
                }
            } catch (_: Exception) {}
        }
    }

    fun updatePlatformSettings(newSettings: PlatformSettings) {
        _platformSettings.value = newSettings
        coroutineScope.launch {
            try {
                firestoreRepository.savePlatformSettings(newSettings)
            } catch (_: Exception) {}
        }
    }

    fun toggleDeveloperVerification(userId: String) {
        _registeredDevelopers.update { list ->
            list.map { dev ->
                if (dev.userId == userId) dev.copy(verifiedBadge = !dev.verifiedBadge) else dev
            }
        }
    }

    fun addRegisteredDeveloper(dev: DeveloperUser) {
        _registeredDevelopers.update { list ->
            if (list.any { it.userId == dev.userId }) list else list + dev
        }
    }

    fun updateProjectTrustScore(projectId: String, newScore: Int) {
        _projects.update { list ->
            list.map { proj ->
                if (proj.id == projectId) {
                    val updatedDev = proj.developer.copy(trustScore = newScore)
                    val updated = proj.copy(developer = updatedDev)
                    coroutineScope.launch {
                        try {
                            firestoreRepository.saveProject(updated)
                        } catch (_: Exception) {}
                    }
                    updated
                } else proj
            }
        }
    }

    fun seedSampleTownship() {
        val sampleDev = SellerProfile(
            id = "sel_gv",
            companyName = "Green Valley Infra Developers",
            tagLine = "Building Verified Plotted Communities",
            establishedYear = 2014,
            completedProjectsCount = 6,
            activeProjectsCount = 2,
            reraRegistrationNo = "PRM/KA/RERA/1250/303/PR/220824/005128",
            businessAddress = "Level 4, Brigade Towers, Airport Road, Bangalore",
            phone = "+91 98450 12890",
            email = "connect@greenvalleyplots.in",
            trustScore = 94,
            identityVerified = true,
            companyDocsVerified = true,
            sourceTransparencyScore = 96,
            reviewRating = 4.8f,
            reviewCount = 24
        )

        val sampleProject = Project(
            id = "proj_green_valley_sample",
            name = "Green Valley Enclave",
            tagline = "BIAAPA & RERA Approved Luxury Villa Plotted Township",
            description = "A premium 25-acre plotted development nestled amidst greenery with 40ft wide black-top tree-lined avenues, underground cabling, 24/7 security, club house, and dedicated jogging tracks.",
            location = "Devanahalli, North Bangalore",
            city = "Bangalore",
            developer = sampleDev,
            totalAcres = 25.0,
            totalPlots = 12,
            availablePlotsCount = 8,
            pricePerSqFt = 3450.0,
            startingPriceText = "₹41.4 L",
            roadWidths = "40 & 60 ft",
            reraNumber = "PRM/KA/RERA/1250/303/PR/220824/005128",
            possessionStatus = "Ready for Registration",
            heroImageRes = com.example.R.drawable.img_green_valley_hero,
            masterplanImageRes = com.example.R.drawable.img_3d_project_master,
            clubhouseImageRes = com.example.R.drawable.img_clubhouse_amenity,
            villaPreviewImageRes = com.example.R.drawable.img_plot_villa_preview,
            amenities = listOf("Grand Entrance Arch", "Underground Cabling", "Rainwater Harvesting", "Swimming Pool", "Clubhouse & Gym", "Parks & Play Area", "24/7 CCTV & Security"),
            surroundings = listOf("Upcoming Metro Station (3 km)", "Kempegowda Int'l Airport (15 mins)", "Devanahalli IT SEZ (5 km)", "Stonehill International School (4 km)"),
            documents = listOf(
                ProjectDocument("doc_1", DocCategory.TITLE_DEED, "Clear Title Deed & Encumbrance Certificate (30 Yrs)", "title_deed_30yr_ec.pdf", "10 Aug 2024", "Green Valley Legal", VerificationStatus.VERIFIED, "Senior Advocate S. Rao", "12 Aug 2024"),
                ProjectDocument("doc_2", DocCategory.LAYOUT_APPROVAL, "BIAAPA Sanctioned Layout Plan (Final)", "biaapa_layout_plan_sanction.pdf", "14 Aug 2024", "BIAAPA Planning Authority", VerificationStatus.VERIFIED, "Govt Surveyor Murthy", "16 Aug 2024"),
                ProjectDocument("doc_3", DocCategory.RERA_DOCUMENT, "Karnataka RERA Registration Certificate", "k_rera_certificate_gv.pdf", "20 Aug 2024", "K-RERA Registry", VerificationStatus.VERIFIED, "K-RERA Nodal Officer", "22 Aug 2024")
            ),
            governmentSources = listOf(
                GovernmentSource("gs_1", "K-RERA Registered Project Verification Portal", "K-RERA Public Search", "https://rera.karnataka.gov.in", "Karnataka Real Estate Regulatory Authority", "15 Aug 2024", "Today"),
                GovernmentSource("gs_2", "BIAAPA Approved Layout Sanction Orders", "BIAAPA Town Planning", "https://biaapa.karnataka.gov.in", "Bangalore International Airport Area Planning Authority", "15 Aug 2024", "Today")
            ),
            timeline = listOf(
                TimelineEvent("tl_1", "12 Aug 2024", "BIAAPA Final Approval Granted", "Final layout plan sanction order issued by planning committee.", "BIAAPA Authority"),
                TimelineEvent("tl_2", "22 Aug 2024", "K-RERA Registration Completed", "Project listed on official RERA portal for public compliance.", "K-RERA Registry")
            ),
            has3DModel = true,
            approvalAuthority = "BIAAPA Approved (No. BIAAPA/TP/LA/114/2021)"
        )

        val samplePlots = (1..12).map { i ->
            val status = when (i) {
                1, 2, 7 -> PlotStatus.SOLD
                4, 9 -> PlotStatus.RESERVED
                else -> PlotStatus.AVAILABLE
            }
            val size = if (i % 3 == 0) 1500 else 1200
            val row = (i - 1) / 4
            val col = (i - 1) % 4
            Plot(
                id = "sample_p_$i",
                projectId = sampleProject.id,
                plotNumber = "P-${String.format("%02d", i)}",
                sizeSqFt = size,
                dimensions = if (size == 1200) "30 x 40 ft" else "30 x 50 ft",
                facing = if (i % 2 == 0) "North" else "East",
                roadWidth = "40 ft Boulevard",
                pricePerSqFt = 3450.0,
                status = status,
                isCornerPlot = (i == 1 || i == 4 || i == 9 || i == 12),
                isParkFacing = (i == 5 || i == 6 || i == 7 || i == 8),
                gridRow = row,
                gridCol = col,
                notes = "Vaastu Compliant, clear boundary pillars installed."
            )
        }

        addProject(sampleProject, samplePlots)
    }

    private fun loadInitialData() {
        // Starts clean with no hardcoded projects, allowing developers to upload and manage real projects
        _projects.value = emptyList()
        _plots.value = emptyMap()
        _leads.value = emptyList()
        _siteVisits.value = emptyList()
        _reviews.value = emptyList()
    }

    fun deleteProject(projectId: String) {
        _projects.update { list -> list.filter { it.id != projectId } }
        _plots.update { map -> map - projectId }
        coroutineScope.launch {
            try {
                firestoreRepository.deleteProject(projectId)
            } catch (_: Exception) {}
        }
    }

    fun deletePlot(projectId: String, plotId: String) {
        _plots.update { map ->
            val projectPlots = map[projectId] ?: return@update map
            map + (projectId to projectPlots.filter { it.id != plotId })
        }
        coroutineScope.launch {
            try {
                firestoreRepository.deletePlot(projectId, plotId)
            } catch (_: Exception) {}
        }
    }

    fun addPlot(projectId: String, newPlot: Plot) {
        _plots.update { map ->
            val plots = map[projectId] ?: emptyList()
            map + (projectId to (plots + newPlot))
        }
        coroutineScope.launch {
            try {
                firestoreRepository.savePlot(newPlot)
            } catch (_: Exception) {}
        }
    }

    fun clearAllProjects() {
        val currentIds = _projects.value.map { it.id }
        _projects.value = emptyList()
        _plots.value = emptyMap()
        coroutineScope.launch {
            for (id in currentIds) {
                try {
                    firestoreRepository.deleteProject(id)
                } catch (_: Exception) {}
            }
        }
    }

    fun updatePlotStatus(projectId: String, plotId: String, newStatus: PlotStatus) {
        _plots.update { currentMap ->
            val projectPlots = currentMap[projectId] ?: return@update currentMap
            val updatedPlots = projectPlots.map { plot ->
                if (plot.id == plotId) plot.copy(status = newStatus) else plot
            }
            currentMap + (projectId to updatedPlots)
        }
        coroutineScope.launch {
            try {
                firestoreRepository.updatePlotStatus(projectId, plotId, newStatus)
            } catch (_: Exception) {}
        }
    }

    fun updatePlotPrice(projectId: String, plotId: String, newPricePerSqFt: Double) {
        _plots.update { currentMap ->
            val projectPlots = currentMap[projectId] ?: return@update currentMap
            val updatedPlots = projectPlots.map { plot ->
                if (plot.id == plotId) plot.copy(pricePerSqFt = newPricePerSqFt) else plot
            }
            currentMap + (projectId to updatedPlots)
        }
    }

    fun addDocument(projectId: String, document: ProjectDocument) {
        _projects.update { list ->
            list.map { proj ->
                if (proj.id == projectId) {
                    val updatedDocs = listOf(document) + proj.documents
                    val updatedTimeline = listOf(
                        TimelineEvent(
                            id = "tl_${System.currentTimeMillis()}",
                            date = "Today",
                            title = "New Document Uploaded: ${document.title}",
                            description = "Category: ${document.category.displayName}. Review status: ${document.status.label}.",
                            actor = document.uploadedBy
                        )
                    ) + proj.timeline
                    val updatedProj = proj.copy(documents = updatedDocs, timeline = updatedTimeline)
                    coroutineScope.launch {
                        try {
                            firestoreRepository.saveProject(updatedProj)
                        } catch (_: Exception) {}
                    }
                    updatedProj
                } else proj
            }
        }
    }

    fun updateDocumentStatus(projectId: String, documentId: String, newStatus: VerificationStatus, reviewer: String, note: String) {
        _projects.update { list ->
            list.map { proj ->
                if (proj.id == projectId) {
                    val updatedDocs = proj.documents.map { doc ->
                        if (doc.id == documentId) {
                            doc.copy(
                                status = newStatus,
                                reviewerName = reviewer,
                                verifiedDate = if (newStatus == VerificationStatus.VERIFIED) "Today" else doc.verifiedDate,
                                notes = note
                            )
                        } else doc
                    }
                    val updatedTimeline = listOf(
                        TimelineEvent(
                            id = "tl_${System.currentTimeMillis()}",
                            date = "Today",
                            title = "Verification Status Updated: $newStatus",
                            description = "Reviewer $reviewer updated document. Notes: $note",
                            actor = reviewer
                        )
                    ) + proj.timeline
                    val updatedProj = proj.copy(documents = updatedDocs, timeline = updatedTimeline)
                    coroutineScope.launch {
                        try {
                            firestoreRepository.saveProject(updatedProj)
                        } catch (_: Exception) {}
                    }
                    updatedProj
                } else proj
            }
        }
    }

    fun addGovernmentSource(projectId: String, source: GovernmentSource) {
        _projects.update { list ->
            list.map { proj ->
                if (proj.id == projectId) {
                    val updatedProj = proj.copy(governmentSources = proj.governmentSources + source)
                    coroutineScope.launch {
                        try {
                            firestoreRepository.saveProject(updatedProj)
                        } catch (_: Exception) {}
                    }
                    updatedProj
                } else proj
            }
        }
    }

    fun addLead(lead: Lead) {
        _leads.update { listOf(lead) + it }
        coroutineScope.launch {
            try {
                firestoreRepository.saveLead(lead)
            } catch (_: Exception) {}
        }
    }

    fun updateLeadStage(leadId: String, newStage: LeadStage) {
        _leads.update { list ->
            list.map { if (it.id == leadId) it.copy(stage = newStage) else it }
        }
    }

    fun addSiteVisit(booking: SiteVisitBooking) {
        _siteVisits.update { listOf(booking) + it }
        coroutineScope.launch {
            try {
                firestoreRepository.saveSiteVisit(booking)
            } catch (_: Exception) {}
        }
        // Also automatically create a CRM lead
        val lead = Lead(
            id = "lead_${System.currentTimeMillis()}",
            name = booking.name,
            phone = booking.phone,
            email = "buyer@plotflow.in",
            interestedPlotNumber = booking.plotNumber,
            projectName = booking.projectName,
            budget = "₹40 - 50 Lakhs",
            stage = LeadStage.SITE_VISIT,
            source = "Site Visit Booking",
            lastContacted = "Today",
            nextFollowUp = "${booking.visitDate} (${booking.timeSlot})",
            notes = "Site visit booked for ${booking.visitorsCount} visitors. Pickup required: ${if (booking.needPickup) "Yes (${booking.pickupAddress})" else "Self-drive"}"
        )
        addLead(lead)
    }

    fun addProject(project: Project, newPlots: List<Plot>) {
        _projects.update { listOf(project) + it }
        _plots.update { map ->
            map + (project.id to newPlots)
        }
        coroutineScope.launch {
            try {
                firestoreRepository.saveProject(project)
                firestoreRepository.savePlots(project.id, newPlots)
            } catch (_: Exception) {}
        }
    }

    fun toggleShortlist(plotId: String) {
        _shortlistedPlotIds.update { set ->
            if (set.contains(plotId)) set - plotId else set + plotId
        }
    }

    fun toggleCompare(plotId: String) {
        _comparePlotIds.update { set ->
            if (set.contains(plotId)) set - plotId else {
                if (set.size >= 3) set else set + plotId
            }
        }
    }
}
