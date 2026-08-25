package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import com.example.model.Project
import com.example.ui.components.LegalDisclaimerBanner
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MarketplaceScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val projects by viewModel.projects.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedLocation by remember { mutableStateOf("All Locations") }
    var selectedFacing by remember { mutableStateOf("All Facings") }
    var selectedStatus by remember { mutableStateOf("All Status") }

    val locationFilterOptions = listOf("All Locations", "Devanahalli, North", "Whitefield Ext", "Sarjapur Road")
    val facingFilterOptions = listOf("All Facings", "East Facing", "North Facing", "West Facing")

    val filteredProjects = projects.filter { proj ->
        val matchesSearch = searchQuery.isBlank() ||
                proj.name.contains(searchQuery, ignoreCase = true) ||
                proj.location.contains(searchQuery, ignoreCase = true)
        val matchesLocation = selectedLocation == "All Locations" ||
                proj.location.contains(selectedLocation.split(",")[0], ignoreCase = true)
        matchesSearch && matchesLocation
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Header
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "BUYER MARKETPLACE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotGreenPrimary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Verified Plotted Developments",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Browse residential gated enclaves with audited titles, 3D masterplans & live plot inventory.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        // Search and Filter Bar
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
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search by project name or locality...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = PlotNavyDark) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("marketplace_search_bar"),
                        shape = RoundedCornerShape(8.dp),
                        singleLine = true
                    )

                    // Quick location chips
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(locationFilterOptions) { loc ->
                            FilterChip(
                                selected = selectedLocation == loc,
                                onClick = { selectedLocation = loc },
                                label = { Text(loc, fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PlotGreenSoft,
                                    selectedLabelColor = PlotGreenDark
                                )
                            )
                        }
                    }
                }
            }
        }

        // Results count
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Showing ${filteredProjects.size} Verified Projects",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.Verified, contentDescription = null, tint = PlotGreenPrimary, modifier = Modifier.size(16.dp))
                    Text("100% Title Audited", fontSize = 12.sp, color = PlotGreenDark, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // Empty State handling
        if (projects.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth().testTag("marketplace_empty_state")
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Surface(
                            shape = androidx.compose.foundation.shape.CircleShape,
                            color = PlotGreenSoft,
                            modifier = Modifier.size(56.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.AddBusiness, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(28.dp))
                            }
                        }
                        Text(
                            text = "No Plotted Townships Published Yet",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )
                        Text(
                            text = "Ready to showcase your real plotted gated enclave, DC conversion documents, and 3D digital twin to buyers?",
                            fontSize = 12.sp,
                            color = PlotTextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 17.sp
                        )
                        Button(
                            onClick = {
                                if (uiState.isDeveloperLoggedIn) {
                                    viewModel.openUploadProjectDialog()
                                } else {
                                    viewModel.navigateTo(AppDestination.DEVELOPER_LOGIN)
                                }
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            modifier = Modifier.fillMaxWidth().height(46.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Publish Real Plotted Township", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        } else if (filteredProjects.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("No projects match your filter", fontWeight = FontWeight.Bold, color = PlotNavyDark)
                        Text("Try clearing your search query or location filter.", fontSize = 12.sp, color = PlotTextSecondary)
                        OutlinedButton(
                            onClick = {
                                searchQuery = ""
                                selectedLocation = "All Locations"
                            }
                        ) {
                            Text("Reset Filters")
                        }
                    }
                }
            }
        }

        // Project Cards
        items(filteredProjects) { project ->
            FeaturedProjectCard(
                project = project,
                onExplore = {
                    viewModel.selectProject(project.id, AppDestination.PROJECT_DETAIL)
                },
                onOpen3D = {
                    viewModel.selectProject(project.id, AppDestination.THREE_D_VIEWER)
                },
                onCheckGenuinity = {
                    viewModel.selectProject(project.id, AppDestination.VERIFICATION_CENTER)
                }
            )
        }

        // Disclaimer
        item {
            LegalDisclaimerBanner()
        }
    }
}
