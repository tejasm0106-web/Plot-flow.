package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.*
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel
import com.example.viewmodel.ProjectTab

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProjectDetailScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val projects by viewModel.projects.collectAsState()
    val plotsMap by viewModel.plotsMap.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val shortlistedIds by viewModel.shortlistedPlotIds.collectAsState()
    val compareIds by viewModel.comparePlotIds.collectAsState()
    val reviews by viewModel.reviews.collectAsState()

    val project = projects.find { it.id == uiState.selectedProjectId } ?: projects.firstOrNull()
    if (project == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(PlotSurfaceLight)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Default.HolidayVillage, contentDescription = null, tint = PlotGreenPrimary, modifier = Modifier.size(56.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text("No Township Selected", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
            Spacer(modifier = Modifier.height(8.dp))
            Text("No real projects have been loaded or selected yet. Add a new plotted project via the Developer Dashboard.", fontSize = 13.sp, color = PlotTextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Go to Developer Dashboard")
            }
        }
        return
    }
    val projectPlots = plotsMap[project.id] ?: emptyList()
    val selectedPlot = projectPlots.find { it.id == uiState.selectedPlotId }

    val tabTitles = listOf(
        ProjectTab.OVERVIEW to "Overview",
        ProjectTab.THREE_D_VIEW to "3D View",
        ProjectTab.PLOT_LAYOUT to "Plot Layout",
        ProjectTab.GALLERY to "Gallery",
        ProjectTab.AMENITIES to "Amenities",
        ProjectTab.LOCATION to "Location",
        ProjectTab.REVIEWS to "Reviews",
        ProjectTab.DOCS_VERIFY to "Documents & Verify"
    )

    Box(modifier = modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(PlotSurfaceLight),
            contentPadding = PaddingValues(bottom = 120.dp)
        ) {
            // Hero Banner with Title and Key Badges
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                ) {
                    Image(
                        painter = painterResource(id = project.heroImageRes),
                        contentDescription = project.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Black.copy(alpha = 0.2f),
                                        PlotNavyDark.copy(alpha = 0.85f)
                                    )
                                )
                            )
                    )

                    // Floating Back / Share / Shortlist Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = PlotNavyDark.copy(alpha = 0.7f),
                            modifier = Modifier.size(38.dp)
                        ) {
                            IconButton(onClick = { viewModel.navigateTo(AppDestination.LANDING) }) {
                                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Surface(
                                shape = CircleShape,
                                color = PlotNavyDark.copy(alpha = 0.7f),
                                modifier = Modifier.size(38.dp)
                            ) {
                                IconButton(onClick = { viewModel.openShareDialog() }) {
                                    Icon(Icons.Default.Share, contentDescription = "Share", tint = Color.White)
                                }
                            }
                        }
                    }

                    // Project Header Info
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = PlotGreenPrimary
                        ) {
                            Text(
                                text = "BMRDA & RERA APPROVED",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                        Text(
                            text = project.name,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.Place, contentDescription = null, tint = PlotGreenLight, modifier = Modifier.size(14.dp))
                            Text(
                                text = project.location,
                                color = Color(0xFFCBD5E1),
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            // Quick Stats Metric Ribbon
            item {
                Surface(
                    color = PlotNavyDark,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        StatItem(label = "Total Land", value = "${project.totalAcres} Acres")
                        StatItem(label = "Total Plots", value = "${project.totalPlots} Units")
                        StatItem(label = "Plot Sizes", value = "1200–2400 sq.ft")
                        StatItem(label = "Rate", value = "₹${project.pricePerSqFt.toInt()}/sq.ft", highlight = true)
                    }
                }
            }

            // Verification Badges Strip
            item {
                Surface(
                    color = PlotGreenSoft,
                    border = BorderStroke(1.dp, PlotGreenLight.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(18.dp))
                        Text(
                            text = "✓ Seller Evidence Verified   ✓ 30-Yr Title Clear   ✓ Official Gov Source Linked",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = PlotGreenDark
                        )
                    }
                }
            }

            // Navigation Tabs Scrollable
            item {
                ScrollableTabRow(
                    selectedTabIndex = uiState.activeProjectTab.ordinal,
                    containerColor = PlotWhite,
                    contentColor = PlotGreenPrimary,
                    edgePadding = 12.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    tabTitles.forEach { (tab, title) ->
                        Tab(
                            selected = uiState.activeProjectTab == tab,
                            onClick = { viewModel.setProjectTab(tab) },
                            text = {
                                Text(
                                    text = title,
                                    fontSize = 12.sp,
                                    fontWeight = if (uiState.activeProjectTab == tab) FontWeight.Bold else FontWeight.Medium
                                )
                            }
                        )
                    }
                }
            }

            // Tab Content Switcher
            when (uiState.activeProjectTab) {
                ProjectTab.OVERVIEW -> {
                    item {
                        OverviewTabContent(
                            project = project,
                            onBookVisit = { viewModel.openSiteVisitDialog() },
                            onCheckGenuinity = { viewModel.setProjectTab(ProjectTab.DOCS_VERIFY) },
                            onOpen3D = { viewModel.setProjectTab(ProjectTab.THREE_D_VIEW) }
                        )
                    }
                }
                ProjectTab.THREE_D_VIEW -> {
                    item {
                        ThreeDTabContent(
                            project = project,
                            plots = projectPlots,
                            selectedPlotId = uiState.selectedPlotId,
                            onPlotSelected = { viewModel.selectPlot(it.id) },
                            onBookSiteVisit = { viewModel.openSiteVisitDialog(uiState.selectedPlotId) },
                            onCheckGenuinity = { viewModel.setProjectTab(ProjectTab.DOCS_VERIFY) }
                        )
                    }
                }
                ProjectTab.PLOT_LAYOUT -> {
                    item {
                        PlotLayoutTabContent(
                            plots = projectPlots,
                            selectedPlotId = uiState.selectedPlotId,
                            onPlotSelected = { viewModel.selectPlot(it.id) }
                        )
                    }
                }
                ProjectTab.GALLERY -> {
                    item {
                        GalleryTabContent(project = project)
                    }
                }
                ProjectTab.AMENITIES -> {
                    item {
                        AmenitiesTabContent(project = project)
                    }
                }
                ProjectTab.LOCATION -> {
                    item {
                        LocationTabContent(project = project)
                    }
                }
                ProjectTab.REVIEWS -> {
                    item {
                        ReviewsTabContent(reviews = reviews)
                    }
                }
                ProjectTab.DOCS_VERIFY -> {
                    item {
                        DocsVerifyTabContent(
                            project = project,
                            onOpenUploadDialog = { viewModel.openDocUploadDialog() },
                            onOpenGovSourceDialog = { viewModel.openGovSourceDialog() }
                        )
                    }
                }
            }

            // Legal notice
            item {
                Box(modifier = Modifier.padding(16.dp)) {
                    LegalDisclaimerBanner()
                }
            }
        }

        // Floating Bottom Plot Detail Sheet when a plot is selected
        if (selectedPlot != null && (uiState.activeProjectTab == ProjectTab.THREE_D_VIEW || uiState.activeProjectTab == ProjectTab.PLOT_LAYOUT)) {
            PlotDetailFloatingSheet(
                plot = selectedPlot,
                isShortlisted = shortlistedIds.contains(selectedPlot.id),
                isCompared = compareIds.contains(selectedPlot.id),
                onToggleShortlist = { viewModel.toggleShortlist(selectedPlot.id) },
                onToggleCompare = { viewModel.toggleCompare(selectedPlot.id) },
                onBookSiteVisit = { viewModel.openSiteVisitDialog(selectedPlot.id) },
                onCheckGenuinity = { viewModel.setProjectTab(ProjectTab.DOCS_VERIFY) },
                onOpen3DPreview = { viewModel.openPlotPreviewModal(selectedPlot.id) },
                onClose = { viewModel.selectPlot(null) },
                modifier = Modifier.align(Alignment.BottomCenter)
            )
        }
    }
}

@Composable
private fun StatItem(label: String, value: String, highlight: Boolean = false) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, fontSize = 10.sp, color = Color(0xFF94A3B8))
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = if (highlight) PlotGreenLight else Color.White
        )
    }
}

@Composable
private fun OverviewTabContent(
    project: Project,
    onBookVisit: () -> Unit,
    onCheckGenuinity: () -> Unit,
    onOpen3D: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // CTA Action Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onCheckGenuinity,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = PlotGreenLight, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Check Genuinity", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = onBookVisit,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Book Site Visit", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        // Trust Score Meter
        TrustScoreMeter(score = project.developer.trustScore)

        // About the Project
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite),
            border = BorderStroke(1.dp, PlotCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Project Description",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
                Text(
                    text = project.description,
                    fontSize = 13.sp,
                    color = PlotTextSecondary,
                    lineHeight = 18.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Road Specifications: ${project.roadWidths}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Possession: ${project.possessionStatus}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PlotGreenDark
                )
            }
        }

        // Seller Trust Profile Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite),
            border = BorderStroke(1.dp, PlotCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "SELLER TRUST PROFILE", fontSize = 10.sp, color = PlotGreenPrimary, fontWeight = FontWeight.Bold)
                        Text(text = project.developer.companyName, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                    }
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = PlotGreenSoft
                    ) {
                        Text(
                            text = "Verified Developer",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotGreenDark,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                        )
                    }
                }

                Text(
                    text = project.developer.tagLine,
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TrustFactorChip("Est. ${project.developer.establishedYear}", Icons.Default.Business)
                    TrustFactorChip("${project.developer.completedProjectsCount} Delivered Projects", Icons.Default.DomainVerification)
                    TrustFactorChip("★ ${project.developer.reviewRating} (${project.developer.reviewCount} reviews)", Icons.Default.Star)
                }

                Divider(color = PlotCardBorder)

                Text(
                    text = "RERA: ${project.developer.reraRegistrationNo}",
                    fontSize = 11.sp,
                    color = PlotTextMuted
                )
                Text(
                    text = "Address: ${project.developer.businessAddress}",
                    fontSize = 11.sp,
                    color = PlotTextMuted
                )
            }
        }

        // 3D Masterplan Teaser
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onOpen3D() }
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(PlotGreenPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ViewInAr, contentDescription = null, tint = Color.White)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "Interactive 3D Digital Twin", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(text = "Tap to inspect individual plot boundaries, road view & villa concepts.", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
                Icon(Icons.Default.ArrowForwardIos, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
private fun TrustFactorChip(text: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Surface(
        shape = RoundedCornerShape(6.dp),
        color = PlotSurfaceLight,
        border = BorderStroke(1.dp, PlotCardBorder)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = PlotNavyDark, modifier = Modifier.size(12.dp))
            Text(text = text, fontSize = 10.sp, color = PlotNavyDark, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun ThreeDTabContent(
    project: Project,
    plots: List<Plot>,
    selectedPlotId: String?,
    onPlotSelected: (Plot) -> Unit,
    onBookSiteVisit: () -> Unit,
    onCheckGenuinity: () -> Unit
) {
    var activeLayer by remember { mutableStateOf("All") }
    val layers = listOf("All", "Plots", "Roads", "Greenery")

    val selectedPlot = plots.find { it.id == selectedPlotId }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Layer Selector
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "3D Digital Twin Viewer", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                layers.forEach { layer ->
                    FilterChip(
                        selected = activeLayer == layer,
                        onClick = { activeLayer = layer },
                        label = { Text(layer, fontSize = 10.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PlotNavyDark,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        // 3D Canvas
        InteractivePlotMasterCanvas(
            plots = plots,
            selectedPlotId = selectedPlotId,
            onPlotSelected = onPlotSelected,
            activeLayer = activeLayer
        )

        // Plot-specific 3D Preview when selected
        if (selectedPlot != null) {
            PlotSpecific3DPreviewCard(
                plot = selectedPlot,
                onBookSiteVisit = onBookSiteVisit,
                onCheckGenuinity = onCheckGenuinity
            )
        }
    }
}

@Composable
private fun PlotLayoutTabContent(
    plots: List<Plot>,
    selectedPlotId: String?,
    onPlotSelected: (Plot) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        PlotGrid2DView(
            plots = plots,
            selectedPlotId = selectedPlotId,
            onPlotSelected = onPlotSelected
        )
    }
}

@Composable
private fun GalleryTabContent(project: Project) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(text = "Project Photo & Media Gallery", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)

        GalleryImageCard(
            resId = project.heroImageRes,
            title = "Aerial Masterplan View",
            tag = "Drone Perspective"
        )

        GalleryImageCard(
            resId = project.masterplanImageRes,
            title = "3D Plotted Township Visualization",
            tag = "Architectural Model"
        )

        GalleryImageCard(
            resId = project.clubhouseImageRes,
            title = "10,000 sq.ft Clubhouse & Swimming Pool",
            tag = "Amenities"
        )

        GalleryImageCard(
            resId = project.villaPreviewImageRes,
            title = "Demarcated Plot with Conceptual Villa Design",
            tag = "Villa Concept"
        )
    }
}

@Composable
private fun GalleryImageCard(resId: Int, title: String, tag: String) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                Image(
                    painter = painterResource(id = resId),
                    contentDescription = title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                Surface(
                    shape = RoundedCornerShape(4.dp),
                    color = PlotNavyDark.copy(alpha = 0.8f),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                ) {
                    Text(text = tag, color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp))
                }
            }
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = PlotNavyDark,
                modifier = Modifier.padding(12.dp)
            )
        }
    }
}

@Composable
private fun AmenitiesTabContent(project: Project) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(text = "Project Infrastructure & Amenities", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)

        project.amenities.forEach { amenity ->
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(PlotGreenSoft),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(18.dp))
                    }
                    Text(text = amenity, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = PlotNavyDark)
                }
            }
        }
    }
}

@Composable
private fun LocationTabContent(project: Project) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(text = "Location Advantage & Connectivity", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite),
            border = BorderStroke(1.dp, PlotCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(text = "Strategic Growth Corridor", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                Text(
                    text = "Located in Devanahalli North Bangalore, the epicentre of high-growth IT corridors, Aerospace SEZ, and upcoming Metro connectivity.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )

                Divider(color = PlotCardBorder)

                project.surroundings.forEach { dist ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = PlotGreenPrimary, modifier = Modifier.size(16.dp))
                        Text(text = dist, fontSize = 12.sp, color = PlotNavyDark, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
private fun ReviewsTabContent(reviews: List<ReviewItem>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "Buyer Reviews & Experience", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
            Surface(shape = RoundedCornerShape(6.dp), color = PlotGreenSoft) {
                Text("★ 4.9 / 5.0 (38 Reviews)", color = PlotGreenDark, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp))
            }
        }

        reviews.forEach { review ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = review.author, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                            Text(text = review.plotBought, fontSize = 11.sp, color = PlotGreenDark, fontWeight = FontWeight.Medium)
                        }
                        Text(text = review.date, fontSize = 11.sp, color = PlotTextMuted)
                    }
                    Text(text = review.comment, fontSize = 12.sp, color = PlotTextSecondary, lineHeight = 16.sp)
                }
            }
        }
    }
}

@Composable
private fun DocsVerifyTabContent(
    project: Project,
    onOpenUploadDialog: () -> Unit,
    onOpenGovSourceDialog: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = "Plot Verification Center", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                Text(text = "Audited evidence & direct government records", fontSize = 12.sp, color = PlotTextSecondary)
            }
            Surface(shape = RoundedCornerShape(6.dp), color = PlotGreenSoft) {
                Text("BMRDA & RERA", color = PlotGreenDark, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp))
            }
        }

        // 10-Point Verification Pillars Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "10-POINT LEGAL & EVIDENCE AUDIT",
                    color = PlotGold,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                VerificationCheckRow("1. Seller Identity & PAN/GST Registration", VerificationStatus.VERIFIED)
                VerificationCheckRow("2. 30-Year Title & Mother Deed Chain", VerificationStatus.VERIFIED)
                VerificationCheckRow("3. BMRDA Sanctioned Layout Plan", VerificationStatus.VERIFIED)
                VerificationCheckRow("4. DC Agricultural to Residential Conversion", VerificationStatus.VERIFIED)
                VerificationCheckRow("5. RERA Registration (K-RERA Registry)", VerificationStatus.VERIFIED)
                VerificationCheckRow("6. E-Khata & Municipal Tax Receipts", VerificationStatus.EVIDENCE_SUBMITTED)
                VerificationCheckRow("7. Non-Encumbrance Nil Certificate (Kaveri)", VerificationStatus.VERIFIED)
                VerificationCheckRow("8. On-Ground Survey Demarcation Boundary", VerificationStatus.VERIFIED)
                VerificationCheckRow("9. Government Revenue Land Record (Bhoomi)", VerificationStatus.VERIFIED)
                VerificationCheckRow("10. Independent Platform Legal Panel Audit", VerificationStatus.VERIFIED)
            }
        }

        // Audited Documents List
        Text(text = "Audited Documents (${project.documents.size})", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)

        project.documents.forEach { doc ->
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = doc.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark, modifier = Modifier.weight(1f))
                        VerificationStatusChip(status = doc.status)
                    }

                    Text(text = "File: ${doc.fileName}", fontSize = 11.sp, color = PlotBlueAccent)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Uploaded: ${doc.uploadedDate} by ${doc.uploadedBy}", fontSize = 10.sp, color = PlotTextMuted)
                        if (doc.reviewerName != null) {
                            Text(text = "Auditor: ${doc.reviewerName}", fontSize = 10.sp, color = PlotGreenDark, fontWeight = FontWeight.Medium)
                        }
                    }

                    if (doc.notes != null) {
                        Text(text = "Note: ${doc.notes}", fontSize = 11.sp, color = PlotTextSecondary)
                    }
                }
            }
        }

        // Government Source Links
        Text(text = "Official Government Source Links", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)

        project.governmentSources.forEach { source ->
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(Icons.Default.Link, contentDescription = null, tint = PlotGreenPrimary, modifier = Modifier.size(20.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = source.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                        Text(text = source.portalName, fontSize = 11.sp, color = PlotTextSecondary)
                        Text(text = "Last verified: ${source.lastChecked}", fontSize = 10.sp, color = PlotTextMuted)
                    }
                    Surface(shape = RoundedCornerShape(4.dp), color = PlotGreenSoft) {
                        Text(text = "Gov Link Live", fontSize = 10.sp, color = PlotGreenDark, fontWeight = FontWeight.Bold, modifier = Modifier.padding(4.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun VerificationCheckRow(title: String, status: VerificationStatus) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = title, color = Color.White, fontSize = 12.sp, modifier = Modifier.weight(1f))
        VerificationStatusChip(status = status)
    }
}
