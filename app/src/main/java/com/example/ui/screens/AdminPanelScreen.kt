package com.example.ui.screens

import androidx.compose.animation.*
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

enum class AdminTab(val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    OVERVIEW("Overview", Icons.Default.Dashboard),
    SYSTEM_CONFIG("Settings", Icons.Default.Tune),
    PROJECTS("Projects", Icons.Default.Domain),
    DEVELOPERS("Developers", Icons.Default.Badge),
    LEADS("All Leads", Icons.Default.Group)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPanelScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val projects by viewModel.projects.collectAsState()
    val plotsMap by viewModel.plotsMap.collectAsState()
    val leads by viewModel.leads.collectAsState()
    val siteVisits by viewModel.siteVisits.collectAsState()
    val platformSettings by viewModel.platformSettings.collectAsState()
    val registeredDevelopers by viewModel.registeredDevelopers.collectAsState()

    var selectedTab by remember { mutableStateOf(AdminTab.OVERVIEW) }
    var showDeleteProjectDialog by remember { mutableStateOf<Project?>(null) }
    var showSeedConfirmDialog by remember { mutableStateOf(false) }
    var showPurgeConfirmDialog by remember { mutableStateOf(false) }

    // System config local form states
    var feePercentInput by remember(platformSettings.platformFeePercent) {
        mutableStateOf(platformSettings.platformFeePercent.toString())
    }
    var broadcastMsgInput by remember(platformSettings.broadcastMessage) {
        mutableStateOf(platformSettings.broadcastMessage)
    }
    var supportEmailInput by remember(platformSettings.supportEmail) {
        mutableStateOf(platformSettings.supportEmail)
    }
    var supportPhoneInput by remember(platformSettings.supportPhone) {
        mutableStateOf(platformSettings.supportPhone)
    }

    // Calculations for KPIs
    val allPlots = plotsMap.values.flatten()
    val totalPlotsCount = allPlots.size
    val availablePlotsCount = allPlots.count { it.status == PlotStatus.AVAILABLE }
    val soldPlotsCount = allPlots.count { it.status == PlotStatus.SOLD }
    val totalGmv = allPlots.sumOf { it.totalPrice }
    val estimatedPlatformRevenue = totalGmv * (platformSettings.platformFeePercent / 100.0)

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight)
            .testTag("admin_panel_container"),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Super Admin Header Banner
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
                modifier = Modifier.fillMaxWidth().testTag("admin_header_card")
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = PlotGold,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        Icons.Default.AdminPanelSettings,
                                        contentDescription = null,
                                        tint = PlotNavyDark,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                            Column {
                                Text(
                                    text = "MASTER OWNER CONTROL",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = PlotGold,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "PlotFlow App Owner Panel",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }

                        // Exit Admin Mode Button
                        OutlinedButton(
                            onClick = { viewModel.logoutAdmin() },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.4f)),
                            shape = RoundedCornerShape(20.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            modifier = Modifier.height(30.dp).testTag("admin_logout_btn")
                        ) {
                            Icon(Icons.Default.ExitToApp, contentDescription = null, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Exit Admin", fontSize = 11.sp)
                        }
                    }

                    // Authenticated Admin Status Badge
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White.copy(alpha = 0.08f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Admin: ${uiState.currentUser?.displayName ?: "Super Admin"} (${uiState.currentUser?.email ?: "owner@plotflow.in"})",
                            fontSize = 11.sp,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = if (platformSettings.isMaintenanceMode) Color(0xFFD32F2F) else PlotGreenPrimary
                        ) {
                            Text(
                                text = if (platformSettings.isMaintenanceMode) "MAINTENANCE MODE" else "SYSTEM LIVE",
                                color = Color.White,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }
        }

        // Navigation Tabs (Overview, Settings, Projects, Developers, Leads)
        item {
            ScrollableTabRow(
                selectedTabIndex = selectedTab.ordinal,
                containerColor = PlotWhite,
                contentColor = PlotNavyDark,
                edgePadding = 4.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .testTag("admin_tabs_row")
            ) {
                AdminTab.values().forEach { tab ->
                    Tab(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        text = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(tab.icon, contentDescription = null, modifier = Modifier.size(16.dp))
                                Text(tab.title, fontWeight = if (selectedTab == tab) FontWeight.Bold else FontWeight.Medium, fontSize = 12.sp)
                            }
                        },
                        selectedContentColor = PlotGreenDark,
                        unselectedContentColor = PlotTextSecondary
                    )
                }
            }
        }

        // TAB 1: MASTER OVERVIEW
        if (selectedTab == AdminTab.OVERVIEW) {
            item {
                Text(
                    text = "Platform Performance & Analytics",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
            }

            // Key Metrics 2x2 Grid
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminKpiCard(
                            title = "Townships Listed",
                            value = "${projects.size}",
                            subtitle = "${registeredDevelopers.size} registered builders",
                            icon = Icons.Default.HolidayVillage,
                            color = PlotNavyDark,
                            modifier = Modifier.weight(1f)
                        )
                        AdminKpiCard(
                            title = "Total Plots",
                            value = "$totalPlotsCount",
                            subtitle = "$availablePlotsCount avail • $soldPlotsCount sold",
                            icon = Icons.Default.GridView,
                            color = PlotGreenDark,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminKpiCard(
                            title = "Platform GMV",
                            value = formatCurrency(totalGmv),
                            subtitle = "Across all listed inventory",
                            icon = Icons.Default.CurrencyRupee,
                            color = Color(0xFF1565C0),
                            modifier = Modifier.weight(1f)
                        )
                        AdminKpiCard(
                            title = "Est. Revenue",
                            value = formatCurrency(estimatedPlatformRevenue),
                            subtitle = "@ ${platformSettings.platformFeePercent}% brokerage",
                            icon = Icons.Default.MonetizationOn,
                            color = Color(0xFF6A1B9A),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        AdminKpiCard(
                            title = "CRM Leads",
                            value = "${leads.size}",
                            subtitle = "${siteVisits.size} booked site visits",
                            icon = Icons.Default.ContactPhone,
                            color = Color(0xFFE65100),
                            modifier = Modifier.weight(1f)
                        )
                        AdminKpiCard(
                            title = "Trust & RERA",
                            value = "${projects.count { it.isReraApproved }}/${projects.size}",
                            subtitle = "Townships RERA Registered",
                            icon = Icons.Default.Verified,
                            color = PlotGreenPrimary,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // Quick Owner Action Panel
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Quick Platform Controls",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { showSeedConfirmDialog = true },
                                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f).testTag("seed_demo_btn")
                            ) {
                                Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Seed Demo Layout", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = { showPurgeConfirmDialog = true },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f).testTag("purge_all_btn")
                            ) {
                                Icon(Icons.Default.DeleteSweep, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Reset All Data", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.BusinessCenter, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Developer SaaS", fontSize = 11.sp)
                            }

                            OutlinedButton(
                                onClick = { viewModel.navigateTo(AppDestination.ADMIN_VERIFY) },
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Legal Audit Queue", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // TAB 2: SYSTEM CONFIGURATION
        if (selectedTab == AdminTab.SYSTEM_CONFIG) {
            item {
                Text(
                    text = "Application Configuration & Brokerage Settings",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
            }

            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth().testTag("system_config_card")
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Maintenance Mode Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Maintenance Mode", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                                Text("Displays maintenance advisory to buyers while allowing admins to configure", fontSize = 11.sp, color = PlotTextSecondary)
                            }
                            Switch(
                                checked = platformSettings.isMaintenanceMode,
                                onCheckedChange = { viewModel.toggleMaintenanceMode() },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFFD32F2F)
                                )
                            )
                        }

                        Divider(color = PlotCardBorder)

                        // Auto-Approve New Projects Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Auto-Approve Uploaded Townships", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                                Text("Publish projects immediately without waiting for empanelled legal audit", fontSize = 11.sp, color = PlotTextSecondary)
                            }
                            Switch(
                                checked = platformSettings.autoApproveNewProjects,
                                onCheckedChange = {
                                    viewModel.updatePlatformSettings(platformSettings.copy(autoApproveNewProjects = it))
                                }
                            )
                        }

                        Divider(color = PlotCardBorder)

                        // RERA Strict Check
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Enforce Mandatory RERA Compliance", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                                Text("Requires valid RERA or BIAAPA/BDA registration for all published layouts", fontSize = 11.sp, color = PlotTextSecondary)
                            }
                            Switch(
                                checked = platformSettings.reraVerificationEnforced,
                                onCheckedChange = {
                                    viewModel.updatePlatformSettings(platformSettings.copy(reraVerificationEnforced = it))
                                }
                            )
                        }

                        Divider(color = PlotCardBorder)

                        // Commission / Platform Brokerage Fee %
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Platform Brokerage / Success Fee (%)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                OutlinedTextField(
                                    value = feePercentInput,
                                    onValueChange = { feePercentInput = it },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true,
                                    trailingIcon = { Text("%", fontWeight = FontWeight.Bold, color = PlotNavyDark) }
                                )
                                Button(
                                    onClick = {
                                        val fee = feePercentInput.toDoubleOrNull() ?: 1.5
                                        viewModel.setPlatformFee(fee)
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Save Fee")
                                }
                            }
                        }

                        Divider(color = PlotCardBorder)

                        // Broadcast Announcement Message
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Platform Broadcast Announcement Banner", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                            OutlinedTextField(
                                value = broadcastMsgInput,
                                onValueChange = { broadcastMsgInput = it },
                                modifier = Modifier.fillMaxWidth(),
                                minLines = 2,
                                maxLines = 3
                            )
                        }

                        // Support Contact details
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = supportEmailInput,
                                onValueChange = { supportEmailInput = it },
                                label = { Text("Support Email") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = supportPhoneInput,
                                onValueChange = { supportPhoneInput = it },
                                label = { Text("Support Phone") },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Button(
                            onClick = {
                                val updated = platformSettings.copy(
                                    platformFeePercent = feePercentInput.toDoubleOrNull() ?: platformSettings.platformFeePercent,
                                    broadcastMessage = broadcastMsgInput,
                                    supportEmail = supportEmailInput,
                                    supportPhone = supportPhoneInput
                                )
                                viewModel.updatePlatformSettings(updated)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().height(44.dp).testTag("save_all_settings_btn")
                        ) {
                            Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Save All Settings", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // TAB 3: TOWNSHIP PROJECTS MANAGEMENT
        if (selectedTab == AdminTab.PROJECTS) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Township Inventory Moderation (${projects.size})",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    Button(
                        onClick = { viewModel.openUploadProjectDialog() },
                        colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Township", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            if (projects.isEmpty()) {
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = PlotWhite),
                        border = BorderStroke(1.dp, PlotCardBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.HolidayVillage, contentDescription = null, tint = PlotTextSecondary, modifier = Modifier.size(36.dp))
                            Text("No Townships Listed", fontWeight = FontWeight.Bold, color = PlotNavyDark)
                            Text("Click 'Seed Demo Layout' or 'Add Township' to populate the marketplace.", fontSize = 12.sp, color = PlotTextSecondary, textAlign = TextAlign.Center)
                            Button(
                                onClick = { viewModel.seedSampleTownship() },
                                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Seed Demo Layout")
                            }
                        }
                    }
                }
            } else {
                items(projects) { project ->
                    val plots = plotsMap[project.id] ?: emptyList()
                    val available = plots.count { it.status == PlotStatus.AVAILABLE }
                    val sold = plots.count { it.status == PlotStatus.SOLD }

                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = PlotWhite),
                        border = BorderStroke(1.dp, PlotCardBorder),
                        modifier = Modifier.fillMaxWidth().testTag("admin_project_item_${project.id}")
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(project.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = PlotNavyDark)
                                    Text(project.location, fontSize = 12.sp, color = PlotTextSecondary)
                                    Text("Developer: ${project.developer.companyName}", fontSize = 11.sp, color = PlotGreenDark, fontWeight = FontWeight.SemiBold)
                                }

                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (project.isReraApproved) PlotGreenSoft else Color(0xFFFFEBEE)
                                ) {
                                    Text(
                                        text = if (project.isReraApproved) "RERA APPROVED" else "PENDING RERA",
                                        color = if (project.isReraApproved) PlotGreenDark else Color(0xFFC62828),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            // Stats Row
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(PlotSurfaceLight, RoundedCornerShape(8.dp))
                                    .padding(8.dp),
                                horizontalArrangement = Arrangement.SpaceAround
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Plots", fontSize = 10.sp, color = PlotTextSecondary)
                                    Text("${plots.size}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Available", fontSize = 10.sp, color = PlotTextSecondary)
                                    Text("$available", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotGreenDark)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Sold", fontSize = 10.sp, color = PlotTextSecondary)
                                    Text("$sold", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFFC62828))
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Rate / SqFt", fontSize = 10.sp, color = PlotTextSecondary)
                                    Text("₹${project.pricePerSqFt.toInt()}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Trust Score", fontSize = 10.sp, color = PlotTextSecondary)
                                    Text("${project.developer.trustScore}/100", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotGold)
                                }
                            }

                            // Action Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        viewModel.selectProject(project.id)
                                        viewModel.navigateTo(AppDestination.PROJECT_DETAIL)
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f).height(36.dp)
                                ) {
                                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Inspect", fontSize = 11.sp)
                                }

                                OutlinedButton(
                                    onClick = {
                                        val newScore = if (project.developer.trustScore >= 95) 85 else project.developer.trustScore + 5
                                        viewModel.updateProjectTrustScore(project.id, newScore)
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.weight(1f).height(36.dp)
                                ) {
                                    Icon(Icons.Default.Verified, contentDescription = null, tint = PlotGold, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("+5 Trust", fontSize = 11.sp)
                                }

                                Button(
                                    onClick = { showDeleteProjectDialog = project },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFEBEE)),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.height(36.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFC62828), modifier = Modifier.size(14.dp))
                                }
                            }
                        }
                    }
                }
            }
        }

        // TAB 4: DEVELOPER KYC & BUILDERS
        if (selectedTab == AdminTab.DEVELOPERS) {
            item {
                Text(
                    text = "Registered Land Developers (${registeredDevelopers.size})",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
            }

            items(registeredDevelopers) { dev ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth().testTag("admin_dev_item_${dev.userId}")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = if (dev.verifiedBadge) PlotGreenSoft else Color(0xFFFFEBEE),
                            modifier = Modifier.size(44.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.Business,
                                    contentDescription = null,
                                    tint = if (dev.verifiedBadge) PlotGreenDark else Color(0xFFC62828),
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(dev.companyName, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                                if (dev.verifiedBadge) {
                                    Icon(Icons.Default.Verified, contentDescription = "Verified Badge", tint = PlotGreenPrimary, modifier = Modifier.size(16.dp))
                                }
                            }
                            Text("Contact: ${dev.name} • ${dev.roleTitle}", fontSize = 11.sp, color = PlotTextSecondary)
                            Text(dev.email, fontSize = 11.sp, color = PlotGreenDark)
                        }

                        Button(
                            onClick = { viewModel.toggleDeveloperVerification(dev.userId) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (dev.verifiedBadge) Color(0xFFFFEBEE) else PlotGreenPrimary
                            ),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text(
                                text = if (dev.verifiedBadge) "Revoke" else "Verify",
                                color = if (dev.verifiedBadge) Color(0xFFC62828) else Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // TAB 5: ALL CRM LEADS & INQUIRIES
        if (selectedTab == AdminTab.LEADS) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Global Pipeline & Leads (${leads.size})",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    Text(
                        text = "${siteVisits.size} Site Visits Booked",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = PlotGreenDark
                    )
                }
            }

            if (leads.isEmpty()) {
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = PlotWhite),
                        border = BorderStroke(1.dp, PlotCardBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.Group, contentDescription = null, tint = PlotTextSecondary, modifier = Modifier.size(36.dp))
                            Text("No Leads Yet", fontWeight = FontWeight.Bold, color = PlotNavyDark)
                            Text("Buyer inquiries and scheduled site visits will be listed here in real-time.", fontSize = 12.sp, color = PlotTextSecondary, textAlign = TextAlign.Center)
                        }
                    }
                }
            } else {
                items(leads) { lead ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = PlotWhite),
                        border = BorderStroke(1.dp, PlotCardBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(lead.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                                    Text("${lead.phone} • ${lead.email}", fontSize = 11.sp, color = PlotTextSecondary)
                                }

                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = when (lead.stage) {
                                        LeadStage.CLOSED -> PlotGreenSoft
                                        LeadStage.SITE_VISIT -> Color(0xFFFFF8E1)
                                        LeadStage.BOOKING -> Color(0xFFE8EAF6)
                                        else -> PlotSurfaceLight
                                    }
                                ) {
                                    Text(
                                        text = lead.stage.label,
                                        color = when (lead.stage) {
                                            LeadStage.CLOSED -> PlotGreenDark
                                            LeadStage.SITE_VISIT -> Color(0xFFF57F17)
                                            LeadStage.BOOKING -> Color(0xFF303F9F)
                                            else -> PlotNavyDark
                                        },
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Project: ${lead.projectName}", fontSize = 11.sp, color = PlotGreenDark, fontWeight = FontWeight.Medium)
                                Text("Plot: ${lead.interestedPlotNumber}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                            }

                            if (lead.notes.isNotEmpty()) {
                                Text(
                                    text = lead.notes,
                                    fontSize = 11.sp,
                                    color = PlotTextSecondary,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(PlotSurfaceLight, RoundedCornerShape(6.dp))
                                        .padding(8.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Confirmation Dialogs
    if (showDeleteProjectDialog != null) {
        val proj = showDeleteProjectDialog!!
        AlertDialog(
            onDismissRequest = { showDeleteProjectDialog = null },
            title = { Text("Delete Township Project?", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to delete '${proj.name}'? This will remove all plot inventory and digital twin maps from the public marketplace.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteProject(proj.id)
                        showDeleteProjectDialog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828))
                ) {
                    Text("Delete Township")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteProjectDialog = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showSeedConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showSeedConfirmDialog = false },
            title = { Text("Seed Sample Verified Township?", fontWeight = FontWeight.Bold) },
            text = { Text("This will add 'Green Valley Enclave' with 12 plots, BIAAPA and RERA approval records, legal deeds, and 3D digital twin to test the platform.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.seedSampleTownship()
                        showSeedConfirmDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary)
                ) {
                    Text("Seed Project")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSeedConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    if (showPurgeConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showPurgeConfirmDialog = false },
            title = { Text("Reset All Platform Projects?", fontWeight = FontWeight.Bold) },
            text = { Text("This will clear all plotted townships and inventories across the database. This cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clearAllProjects()
                        showPurgeConfirmDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828))
                ) {
                    Text("Clear All")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPurgeConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun AdminKpiCard(
    title: String,
    value: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, fontSize = 11.sp, color = PlotTextSecondary, fontWeight = FontWeight.Medium)
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
            }
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = color)
            Text(subtitle, fontSize = 9.sp, color = PlotTextSecondary)
        }
    }
}

private fun formatCurrency(amount: Double): String {
    return if (amount >= 10000000) {
        String.format("₹%.2f Cr", amount / 10000000)
    } else if (amount >= 100000) {
        String.format("₹%.2f L", amount / 100000)
    } else {
        String.format("₹%,.0f", amount)
    }
}
