package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Plot
import com.example.model.PlotStatus
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DeveloperDashboardScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val projects by viewModel.projects.collectAsState()
    val plotsMap by viewModel.plotsMap.collectAsState()
    val leads by viewModel.leads.collectAsState()
    val siteVisits by viewModel.siteVisits.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    var projectToDelete by remember { mutableStateOf<com.example.model.Project?>(null) }
    var plotToDelete by remember { mutableStateOf<Plot?>(null) }

    // Access Restriction Barrier if not authenticated as Developer
    if (!uiState.isDeveloperLoggedIn) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(PlotSurfaceLight)
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = PlotNavyDark,
                modifier = Modifier.size(72.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Restricted Access",
                        tint = PlotGold,
                        modifier = Modifier.size(40.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Surface(
                shape = RoundedCornerShape(16.dp),
                color = PlotRedLight,
                border = BorderStroke(1.dp, PlotRed.copy(alpha = 0.3f))
            ) {
                Text(
                    text = "RESTRICTED ACCESS • BUILDERS ONLY",
                    color = PlotRed,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Developer Dashboard Locked",
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold,
                color = PlotNavyDark
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "The Developer Dashboard is restricted to authenticated real estate builders and plotted layout developers to manage inventory, upload layouts, and view CRM leads.",
                fontSize = 13.sp,
                color = PlotTextSecondary,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_LOGIN) },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("restricted_login_dev_btn")
            ) {
                Icon(Icons.Default.BusinessCenter, contentDescription = null, tint = PlotGold, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign In as Developer", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedButton(
                onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp)
            ) {
                Text("Back to Buyer Marketplace", color = PlotNavyDark, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
            }
        }
        return
    }

    val currentProject = projects.find { it.id == uiState.selectedProjectId } ?: projects.firstOrNull()
    val currentPlots = currentProject?.let { plotsMap[it.id] } ?: emptyList()

    val availableCount = currentPlots.count { it.status == PlotStatus.AVAILABLE }
    val reservedCount = currentPlots.count { it.status == PlotStatus.RESERVED }
    val soldCount = currentPlots.count { it.status == PlotStatus.SOLD }
    val totalCount = currentPlots.size

    val devName = uiState.currentDeveloperUser?.companyName ?: currentProject?.developer?.companyName ?: "Builder Organization"
    val devUser = uiState.currentDeveloperUser?.name ?: "Authorized Developer"

    // Project Delete Confirmation Dialog
    if (projectToDelete != null) {
        AlertDialog(
            onDismissRequest = { projectToDelete = null },
            title = { Text("Delete Township Project?") },
            text = { Text("Are you sure you want to remove '${projectToDelete?.name}'? This will permanently delete its plots, documents, and 3D twin from the marketplace.") },
            confirmButton = {
                Button(
                    onClick = {
                        val id = projectToDelete?.id
                        projectToDelete = null
                        if (id != null) viewModel.deleteProject(id)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PlotRed)
                ) {
                    Text("Delete", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { projectToDelete = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Plot Delete Confirmation Dialog
    if (plotToDelete != null && currentProject != null) {
        AlertDialog(
            onDismissRequest = { plotToDelete = null },
            title = { Text("Delete Plot ${plotToDelete?.plotNumber}?") },
            text = { Text("Are you sure you want to remove this plot from the layout inventory?") },
            confirmButton = {
                Button(
                    onClick = {
                        val plotId = plotToDelete?.id
                        plotToDelete = null
                        if (plotId != null) viewModel.deletePlot(currentProject.id, plotId)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PlotRed)
                ) {
                    Text("Delete Plot", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { plotToDelete = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header & Developer Auth Status Bar
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
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
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = PlotGreenPrimary,
                                modifier = Modifier.size(10.dp)
                            ) {}
                            Text(
                                text = "AUTHENTICATED DEVELOPER SESSION",
                                color = PlotGold,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp
                            )
                        }

                        // Logout / Switch to Buyer
                        TextButton(
                            onClick = { viewModel.logoutDeveloper() },
                            colors = ButtonDefaults.textButtonColors(contentColor = PlotGold),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Logout (Buyer Mode)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Text(
                        text = devName,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                    Text(
                        text = "User: $devUser • Changes update Buyer Marketplace in Real-Time",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.8f)
                    )

                    Divider(color = Color.White.copy(alpha = 0.15f))

                    // Quick Layout & Upload Actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { viewModel.openUploadProjectDialog() },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1.3f)
                                .testTag("btn_upload_new_layout")
                        ) {
                            Icon(Icons.Default.AddBusiness, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add Real Project", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        if (currentProject != null) {
                            OutlinedButton(
                                onClick = { viewModel.navigateTo(AppDestination.PROJECT_DETAIL) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.5f)),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.RemoveRedEye, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("View 3D Twin", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // Empty state when developer has no projects added yet
        if (projects.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.5.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth().testTag("dev_empty_state_card")
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = PlotGreenSoft,
                            modifier = Modifier.size(64.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.AddBusiness,
                                    contentDescription = null,
                                    tint = PlotGreenDark,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }

                        Text(
                            text = "No Real Projects Added Yet",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )

                        Text(
                            text = "The sample dummy project has been removed. You can now add your real plotted township, gated layout, or villa community. You can configure total acres, plot dimensions, RERA numbers, pricing, and live inventory status.",
                            fontSize = 13.sp,
                            color = PlotTextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 18.sp
                        )

                        Button(
                            onClick = { viewModel.openUploadProjectDialog() },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("btn_empty_state_add_project")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Add Your First Plotted Township", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        } else if (currentProject != null) {
            // Project Switcher Bar with Add & Delete Options
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Active Townships (${projects.size})",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = PlotNavyDark
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                TextButton(
                                    onClick = { viewModel.openUploadProjectDialog() },
                                    colors = ButtonDefaults.textButtonColors(contentColor = PlotGreenPrimary)
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Add Another", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }

                                IconButton(
                                    onClick = { projectToDelete = currentProject },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete Township", tint = PlotRed, modifier = Modifier.size(18.dp))
                                }
                            }
                        }

                        // Project selector chips
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            projects.forEach { proj ->
                                val isSelected = proj.id == currentProject.id
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (isSelected) PlotNavyDark else PlotSurfaceLight,
                                    border = BorderStroke(1.dp, if (isSelected) PlotNavyDark else PlotCardBorder),
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { viewModel.selectProject(proj.id, AppDestination.DEVELOPER_DASHBOARD) }
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Text(
                                            text = proj.name,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSelected) Color.White else PlotNavyDark,
                                            maxLines = 1
                                        )
                                        Text(
                                            text = "${proj.totalPlots} Plots • ${proj.location}",
                                            fontSize = 9.sp,
                                            color = if (isSelected) PlotGold else PlotTextMuted,
                                            maxLines = 1
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Quick SaaS Metric Cards Grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        MetricCard("Total Plots", "$totalCount Units", PlotNavyDark, Modifier.weight(1f))
                        MetricCard("Available", "$availableCount Units", PlotGreenPrimary, Modifier.weight(1f))
                        MetricCard("Reserved", "$reservedCount Units", PlotGold, Modifier.weight(1f))
                        MetricCard("Sold", "$soldCount Units", PlotRed, Modifier.weight(1f))
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        MetricCard("Active Leads", "${leads.size} Inquiries", PlotNavyLight, Modifier.weight(1f))
                        MetricCard("Site Visits", "${siteVisits.size} Booked", PlotGreenDark, Modifier.weight(1f))
                        MetricCard("Conversion", "${(soldCount * 100) / totalCount.coerceAtLeast(1)}%", PlotNavyDark, Modifier.weight(1f))
                    }
                }
            }

            // SaaS Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { viewModel.openDocUploadDialog() },
                        colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Upload Document", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { viewModel.openGovSourceDialog() },
                        colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Link, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Gov Link", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { viewModel.navigateTo(AppDestination.CRM_LEADS) },
                        colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.People, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Leads CRM", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Plot Inventory Table Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Live Plot Inventory ($totalCount Plots)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    Text(
                        text = "Instant Status Toggle",
                        fontSize = 11.sp,
                        color = PlotGreenDark,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Plots Table Items
            items(currentPlots) { plot ->
                Card(
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("inventory_row_${plot.plotNumber}")
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Plot ${plot.plotNumber}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = PlotNavyDark
                                )
                                Text(
                                    text = "${plot.sizeSqFt} sq.ft (${plot.dimensions}) • ${plot.facing} • ${plot.roadWidth}",
                                    fontSize = 11.sp,
                                    color = PlotTextSecondary
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = plot.formattedPrice,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = PlotNavyDark
                                    )
                                    Text(
                                        text = "₹${plot.pricePerSqFt.toInt()}/sq.ft",
                                        fontSize = 10.sp,
                                        color = PlotTextMuted
                                    )
                                }

                                IconButton(
                                    onClick = { plotToDelete = plot },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        Icons.Default.DeleteOutline,
                                        contentDescription = "Delete Plot",
                                        tint = PlotRed.copy(alpha = 0.7f),
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }

                        // Live Status Change Chips (Immediate synchronization)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "Status:", fontSize = 11.sp, color = PlotTextSecondary, fontWeight = FontWeight.Medium)
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                StatusToggleBtn(
                                    label = "Available",
                                    isSelected = plot.status == PlotStatus.AVAILABLE,
                                    activeColor = PlotGreenPrimary,
                                    onClick = {
                                        viewModel.updatePlotStatus(currentProject.id, plot.id, PlotStatus.AVAILABLE)
                                    }
                                )
                                StatusToggleBtn(
                                    label = "Reserved",
                                    isSelected = plot.status == PlotStatus.RESERVED,
                                    activeColor = PlotGold,
                                    onClick = {
                                        viewModel.updatePlotStatus(currentProject.id, plot.id, PlotStatus.RESERVED)
                                    }
                                )
                                StatusToggleBtn(
                                    label = "Sold",
                                    isSelected = plot.status == PlotStatus.SOLD,
                                    activeColor = PlotRed,
                                    onClick = {
                                        viewModel.updatePlotStatus(currentProject.id, plot.id, PlotStatus.SOLD)
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricCard(label: String, value: String, accentColor: Color, modifier: Modifier = Modifier) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = label, fontSize = 10.sp, color = PlotTextMuted)
            Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = accentColor)
        }
    }
}

@Composable
private fun StatusToggleBtn(
    label: String,
    isSelected: Boolean,
    activeColor: Color,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(6.dp),
        color = if (isSelected) activeColor else PlotSurfaceLight,
        border = BorderStroke(1.dp, if (isSelected) activeColor else PlotCardBorder)
    ) {
        Text(
            text = label,
            fontSize = 10.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) Color.White else PlotNavyDark,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
