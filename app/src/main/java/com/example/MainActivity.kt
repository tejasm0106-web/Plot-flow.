package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.UserRole
import com.example.ui.components.*
import com.example.ui.screens.*
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: PlotFlowViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                PlotFlowApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlotFlowApp(viewModel: PlotFlowViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val projects by viewModel.projects.collectAsState()
    val shortlistedIds by viewModel.shortlistedPlotIds.collectAsState()
    val compareIds by viewModel.comparePlotIds.collectAsState()
    val platformSettings by viewModel.platformSettings.collectAsState()

    val currentProject = projects.find { it.id == uiState.selectedProjectId } ?: projects.firstOrNull()
    val snackbarHostState = remember { SnackbarHostState() }

    // Observe user notifications
    LaunchedEffect(uiState.userNotification) {
        uiState.userNotification?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearNotification()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.clickable { viewModel.navigateTo(AppDestination.LANDING) }
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = PlotGreenPrimary,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Layers, contentDescription = "PlotFlow Logo", tint = Color.White, modifier = Modifier.size(20.dp))
                            }
                        }
                        Column {
                            Text(
                                text = "PlotFlow",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = PlotNavyDark,
                                letterSpacing = (-0.5).sp
                            )
                            Text(
                                text = "Trust Every Plot",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = PlotGreenPrimary
                            )
                        }
                    }
                },
                actions = {
                    // Admin / Owner Mode Action Button
                    if (uiState.isAdminLoggedIn) {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = PlotNavyDark,
                            border = BorderStroke(1.dp, PlotGold),
                            modifier = Modifier
                                .clickable { viewModel.navigateTo(AppDestination.ADMIN_PANEL) }
                                .padding(end = 4.dp)
                                .testTag("topbar_admin_badge")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = PlotGold, modifier = Modifier.size(14.dp))
                                Text("Owner Admin", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = PlotGold)
                            }
                        }
                    } else if (uiState.currentUser != null) {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (uiState.isDeveloperLoggedIn) PlotNavyDark else PlotGreenSoft,
                            border = BorderStroke(1.dp, if (uiState.isDeveloperLoggedIn) PlotGold else PlotGreenPrimary),
                            modifier = Modifier
                                .clickable {
                                    if (uiState.isDeveloperLoggedIn) {
                                        viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD)
                                    } else {
                                        viewModel.navigateTo(AppDestination.DEVELOPER_LOGIN)
                                    }
                                }
                                .padding(end = 4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Icon(
                                    imageVector = if (uiState.isDeveloperLoggedIn) Icons.Default.BusinessCenter else Icons.Default.Person,
                                    contentDescription = null,
                                    tint = if (uiState.isDeveloperLoggedIn) PlotGold else PlotGreenDark,
                                    modifier = Modifier.size(12.dp)
                                )
                                Text(
                                    text = if (uiState.isDeveloperLoggedIn)
                                        (uiState.currentDeveloperUser?.companyName ?: "Developer").take(14)
                                    else
                                        "Buyer: ${(uiState.currentUser?.displayName ?: "User").take(10)}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (uiState.isDeveloperLoggedIn) PlotGold else PlotGreenDark
                                )
                            }
                        }
                    } else {
                        OutlinedButton(
                            onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_LOGIN) },
                            shape = RoundedCornerShape(20.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            border = BorderStroke(1.dp, PlotNavyDark.copy(alpha = 0.4f)),
                            modifier = Modifier
                                .height(32.dp)
                                .testTag("topbar_auth_btn")
                        ) {
                            Icon(Icons.Default.Lock, contentDescription = null, tint = PlotNavyDark, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Sign In", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                        }
                    }

                    // Admin Quick Launch Icon
                    IconButton(
                        onClick = {
                            if (uiState.isAdminLoggedIn) {
                                viewModel.navigateTo(AppDestination.ADMIN_PANEL)
                            } else {
                                viewModel.loginAdmin()
                            }
                        },
                        modifier = Modifier.testTag("nav_admin_panel_btn")
                    ) {
                        Icon(
                            Icons.Default.AdminPanelSettings,
                            contentDescription = "Admin Panel",
                            tint = if (uiState.isAdminLoggedIn) PlotGold else PlotNavyDark
                        )
                    }

                    // Compare & Shortlist Button
                    IconButton(
                        onClick = { viewModel.navigateTo(AppDestination.SHORTLIST_COMPARE) },
                        modifier = Modifier.testTag("nav_compare_btn")
                    ) {
                        BadgedBox(
                            badge = {
                                val totalSaved = shortlistedIds.size + compareIds.size
                                if (totalSaved > 0) {
                                    Badge(containerColor = PlotGreenPrimary) { Text("$totalSaved") }
                                }
                            }
                        ) {
                            Icon(Icons.Default.FavoriteBorder, contentDescription = "Shortlist / Compare", tint = PlotNavyDark)
                        }
                    }

                    // Investor Pitch & Specs
                    IconButton(
                        onClick = { viewModel.navigateTo(AppDestination.INVESTOR_PITCH) },
                        modifier = Modifier.testTag("nav_investor_pitch_btn")
                    ) {
                        Icon(Icons.Default.AutoGraph, contentDescription = "Investor Pitch", tint = PlotNavyDark)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = PlotWhite)
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = PlotWhite,
                tonalElevation = 8.dp
            ) {
                NavBarItem(
                    selected = uiState.currentDestination == AppDestination.LANDING,
                    onClick = { viewModel.navigateTo(AppDestination.LANDING) },
                    icon = Icons.Default.Home,
                    label = "Home"
                )
                NavBarItem(
                    selected = uiState.currentDestination == AppDestination.MARKETPLACE,
                    onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                    icon = Icons.Default.Explore,
                    label = "Explore"
                )
                NavBarItem(
                    selected = uiState.currentDestination == AppDestination.PROJECT_DETAIL || uiState.currentDestination == AppDestination.THREE_D_VIEWER,
                    onClick = { viewModel.navigateTo(AppDestination.PROJECT_DETAIL) },
                    icon = Icons.Default.ViewInAr,
                    label = "3D Twin"
                )
                NavBarItem(
                    selected = uiState.currentDestination == AppDestination.VERIFICATION_CENTER,
                    onClick = { viewModel.navigateTo(AppDestination.VERIFICATION_CENTER) },
                    icon = Icons.Default.VerifiedUser,
                    label = "Verify"
                )

                // Navigation Priority: Admin -> Developer -> Saved
                if (uiState.isAdminLoggedIn) {
                    NavBarItem(
                        selected = uiState.currentDestination == AppDestination.ADMIN_PANEL,
                        onClick = { viewModel.navigateTo(AppDestination.ADMIN_PANEL) },
                        icon = Icons.Default.AdminPanelSettings,
                        label = "Admin Panel"
                    )
                } else if (uiState.isDeveloperLoggedIn && uiState.currentUserRole == UserRole.DEVELOPER) {
                    NavBarItem(
                        selected = uiState.currentDestination == AppDestination.DEVELOPER_DASHBOARD || uiState.currentDestination == AppDestination.CRM_LEADS,
                        onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                        icon = Icons.Default.Dashboard,
                        label = "Developer Dashboard"
                    )
                } else {
                    NavBarItem(
                        selected = uiState.currentDestination == AppDestination.SHORTLIST_COMPARE,
                        onClick = { viewModel.navigateTo(AppDestination.SHORTLIST_COMPARE) },
                        icon = Icons.Default.BookmarkBorder,
                        label = "Saved"
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Maintenance Banner (if enabled)
            if (platformSettings.isMaintenanceMode && uiState.currentDestination != AppDestination.ADMIN_PANEL) {
                Surface(
                    color = Color(0xFFD32F2F),
                    modifier = Modifier.fillMaxWidth().clickable { viewModel.navigateTo(AppDestination.ADMIN_PANEL) }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Text(
                            text = "Platform Maintenance Active: System is undergoing scheduled upgrades.",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = "Admin Panel",
                            color = Color.Yellow,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f)
            ) {
                AnimatedContent(
                    targetState = uiState.currentDestination,
                    transitionSpec = {
                        fadeIn() togetherWith fadeOut()
                    },
                    label = "ScreenTransition"
                ) { destination ->
                    when (destination) {
                        AppDestination.LANDING -> LandingScreen(viewModel = viewModel)
                        AppDestination.MARKETPLACE -> MarketplaceScreen(viewModel = viewModel)
                        AppDestination.PROJECT_DETAIL -> ProjectDetailScreen(viewModel = viewModel)
                        AppDestination.THREE_D_VIEWER -> ThreeDViewerScreen(viewModel = viewModel)
                        AppDestination.VERIFICATION_CENTER -> VerificationCenterScreen(viewModel = viewModel)
                        AppDestination.DEVELOPER_DASHBOARD -> DeveloperDashboardScreen(viewModel = viewModel)
                        AppDestination.DEVELOPER_LOGIN, AppDestination.AUTH -> AuthScreen(viewModel = viewModel)
                        AppDestination.CRM_LEADS -> LeadCrmScreen(viewModel = viewModel)
                        AppDestination.SHORTLIST_COMPARE -> CompareShortlistScreen(viewModel = viewModel)
                        AppDestination.INVESTOR_PITCH -> InvestorPitchScreen(viewModel = viewModel)
                        AppDestination.ADMIN_VERIFY -> AdminVerificationScreen(viewModel = viewModel)
                        AppDestination.ADMIN_PANEL -> AdminPanelScreen(viewModel = viewModel)
                    }
                }
            }
        }
    }

    // Modal Dialogs
    if (uiState.isUploadProjectDialogOpen) {
        UploadProjectDialog(
            onDismiss = { viewModel.closeUploadProjectDialog() },
            onUpload = { name, tagline, location, city, authority, reraNo, acres, plots, price, desc, amenities ->
                viewModel.uploadNewProject(
                    name = name,
                    tagline = tagline,
                    location = location,
                    city = city,
                    approvalAuthority = authority,
                    reraNumber = reraNo,
                    totalAcres = acres,
                    totalPlots = plots,
                    pricePerSqFt = price,
                    description = desc,
                    amenities = amenities
                )
            }
        )
    }
    if (uiState.isSiteVisitDialogOpen && currentProject != null) {
        val plotNumber = uiState.selectedPlotId?.let { id ->
            val plots = viewModel.plotsMap.value[currentProject.id] ?: emptyList()
            plots.find { it.id == id }?.plotNumber
        } ?: "Selected Plot"

        BookSiteVisitDialog(
            projectName = currentProject.name,
            plotNumber = plotNumber,
            onDismiss = { viewModel.closeSiteVisitDialog() },
            onConfirm = { name, phone, date, timeSlot, visitors, needPickup, address ->
                viewModel.bookSiteVisit(
                    name = name,
                    phone = phone,
                    date = date,
                    timeSlot = timeSlot,
                    visitorsCount = visitors,
                    needPickup = needPickup,
                    pickupAddress = address
                )
            }
        )
    }

    if (uiState.isDocUploadDialogOpen && currentProject != null) {
        DocumentUploadDialog(
            onDismiss = { viewModel.closeDocUploadDialog() },
            onUpload = { category, title, fileName, sourceUrl ->
                viewModel.uploadDocument(
                    category = category,
                    title = title,
                    fileName = fileName,
                    sourceUrl = sourceUrl
                )
            }
        )
    }

    if (uiState.isGovSourceDialogOpen && currentProject != null) {
        AddGovernmentSourceDialog(
            onDismiss = { viewModel.closeGovSourceDialog() },
            onSave = { title, portalName, url, authorityName ->
                viewModel.addGovSource(
                    title = title,
                    portalName = portalName,
                    url = url,
                    authorityName = authorityName
                )
            }
        )
    }

    if (uiState.isShareDialogOpen && currentProject != null) {
        ShareProjectDialog(
            projectName = currentProject.name,
            location = currentProject.location,
            onDismiss = { viewModel.closeShareDialog() }
        )
    }
}

@Composable
private fun RowScope.NavBarItem(
    selected: Boolean,
    onClick: () -> Unit,
    icon: ImageVector,
    label: String
) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (selected) PlotGreenPrimary else PlotNavyDark.copy(alpha = 0.6f)
            )
        },
        label = {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                color = if (selected) PlotGreenPrimary else PlotNavyDark.copy(alpha = 0.6f)
            )
        },
        colors = NavigationBarItemDefaults.colors(
            indicatorColor = PlotGreenSoft
        )
    )
}
