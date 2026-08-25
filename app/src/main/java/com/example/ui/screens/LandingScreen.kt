package com.example.ui.screens

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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.Project
import com.example.model.UserRole
import com.example.ui.components.FeatureBadge
import com.example.ui.components.LegalDisclaimerBanner
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LandingScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val projects by viewModel.projects.collectAsState()
    var searchLocation by remember { mutableStateOf("") }
    var selectedBudget by remember { mutableStateOf("All Budgets") }
    var selectedFacing by remember { mutableStateOf("All Facings") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Hero Section
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(480.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.img_green_valley_hero),
                    contentDescription = "PlotFlow Hero Masterplan",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    PlotNavyDark.copy(alpha = 0.85f),
                                    PlotNavyDark.copy(alpha = 0.65f),
                                    PlotNavyDark.copy(alpha = 0.95f)
                                )
                            )
                        )
                )

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.Center
                ) {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = PlotGreenPrimary.copy(alpha = 0.2f),
                        border = BorderStroke(1.dp, PlotGreenLight)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = PlotGreenLight, modifier = Modifier.size(16.dp))
                            Text(
                                text = "Trust Every Plot — BMRDA & RERA Verified",
                                color = PlotGreenLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Don't Just Find a Plot.\nExperience It. Verify It. Trust It.",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        lineHeight = 32.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "PlotFlow brings interactive plot layouts, immersive 3D visualization, seller verification and property evidence together in one transparent buying experience.",
                        fontSize = 13.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // Floating Badges Row
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        HeroBadge("✓ Verified Seller")
                        HeroBadge("✓ Documents Available")
                        HeroBadge("✓ Government Source Linked")
                        HeroBadge("✓ 3D Project View")
                        HeroBadge("✓ Site Visit Available")
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                            modifier = Modifier
                                .weight(1.2f)
                                .height(46.dp)
                                .testTag("hero_explore_plots_btn"),
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Explore Verified Plots", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                        }

                        OutlinedButton(
                            onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp)
                                .testTag("hero_developer_saas_btn"),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.8f)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("For Developers", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Search Bar Section
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .offset(y = (-24).dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                border = BorderStroke(1.dp, PlotCardBorder)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.Search, contentDescription = null, tint = PlotGreenPrimary)
                        Text(
                            text = "Where do you want to buy your plot?",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )
                    }

                    OutlinedTextField(
                        value = searchLocation,
                        onValueChange = { searchLocation = it },
                        placeholder = { Text("Location (e.g. Devanahalli, North Bangalore)") },
                        leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = PlotNavyDark) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("search_location_input"),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                selectedBudget = if (selectedBudget == "Under ₹50L") "All Budgets" else "Under ₹50L"
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (selectedBudget == "Under ₹50L") PlotGreenSoft else Color.Transparent
                            ),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Budget: < ₹50L", fontSize = 11.sp, color = PlotNavyDark)
                        }

                        OutlinedButton(
                            onClick = {
                                selectedFacing = if (selectedFacing == "East Facing") "All Facings" else "East Facing"
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = if (selectedFacing == "East Facing") PlotGreenSoft else Color.Transparent
                            ),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("East Facing", fontSize = 11.sp, color = PlotNavyDark)
                        }
                    }

                    Button(
                        onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("search_submit_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.FilterList, contentDescription = null, tint = PlotGreenLight)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Search Verified Plots", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }

        // 4 Core Proposition Pillars
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "THE PLOTFLOW DIFFERENCE",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotGreenPrimary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "See the plot. Experience the project. Verify the evidence. Trust the seller.",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark,
                    lineHeight = 24.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    PillarCard(
                        icon = Icons.Default.ViewInAr,
                        title = "3D Visualizer",
                        desc = "Explore roads, trees, villa mockups & sun path in spatial 3D.",
                        modifier = Modifier.weight(1f),
                        onClick = { viewModel.navigateTo(AppDestination.THREE_D_VIEWER) }
                    )
                    PillarCard(
                        icon = Icons.Default.VerifiedUser,
                        title = "Evidence Center",
                        desc = "Audit 30-year mother deeds, BMRDA approvals & official gov links.",
                        modifier = Modifier.weight(1f),
                        onClick = { viewModel.navigateTo(AppDestination.VERIFICATION_CENTER) }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    PillarCard(
                        icon = Icons.Default.Sync,
                        title = "Live Inventory",
                        desc = "Real-time sync when developers reserve or sell individual plots.",
                        modifier = Modifier.weight(1f),
                        onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) }
                    )
                    PillarCard(
                        icon = Icons.Default.DirectionsCar,
                        title = "Site Visit Pass",
                        desc = "Complimentary airport/metro pickup & guided property tour.",
                        modifier = Modifier.weight(1f),
                        onClick = { viewModel.openSiteVisitDialog() }
                    )
                }
            }
        }

        // Featured Projects Section
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Featured Plotted Developments",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )
                        Text(
                            text = "100% verified titles and live plot inventory",
                            fontSize = 12.sp,
                            color = PlotTextSecondary
                        )
                    }
                    TextButton(onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) }) {
                        Text("View All", color = PlotGreenPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        if (projects.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.AddBusiness, contentDescription = null, tint = PlotGreenPrimary, modifier = Modifier.size(32.dp))
                        Text("No Plotted Layouts Added Yet", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                        Text("Developers: Sign in to add your real township, gated layouts, and villa plots.", fontSize = 11.sp, color = PlotTextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                        Button(
                            onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_LOGIN) },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Developer Portal", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        items(projects) { project ->
            FeaturedProjectCard(
                project = project,
                onExplore = {
                    viewModel.selectProject(project.id)
                },
                onOpen3D = {
                    viewModel.selectProject(project.id, AppDestination.THREE_D_VIEWER)
                },
                onCheckGenuinity = {
                    viewModel.selectProject(project.id, AppDestination.VERIFICATION_CENTER)
                },
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        // Investor / SaaS Section Banner
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyDark)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.AutoGraph, contentDescription = null, tint = PlotGold)
                        Text(
                            text = "DEVELOPER SAAS & INVESTOR OVERVIEW",
                            color = PlotGold,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "Powering the Next Generation of Plotted Developments",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "From interactive 3D digital twins and live CRM inventory to legal verification timelines and site visit booking.",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { viewModel.navigateTo(AppDestination.INVESTOR_PITCH) },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGold),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Investor Pitch & Specs", color = PlotNavyDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                        if (uiState.isDeveloperLoggedIn && uiState.currentUserRole == UserRole.DEVELOPER) {
                            OutlinedButton(
                                onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = PlotGold),
                                border = BorderStroke(1.dp, PlotGold),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(
                                    Icons.Default.Dashboard,
                                    contentDescription = null,
                                    tint = PlotGold,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    "Developer Dashboard",
                                    color = PlotGold,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        } else {
                            OutlinedButton(
                                onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_LOGIN) },
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                                border = BorderStroke(1.dp, PlotNavyLight),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(
                                    Icons.Default.Lock,
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    "Builder Login",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        // Disclaimer
        item {
            Box(modifier = Modifier.padding(16.dp)) {
                LegalDisclaimerBanner()
            }
        }
    }
}

@Composable
private fun HeroBadge(text: String) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color.White.copy(alpha = 0.15f),
        border = BorderStroke(0.8.dp, Color.White.copy(alpha = 0.3f))
    ) {
        Text(
            text = text,
            color = Color.White,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun PillarCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    desc: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = PlotWhite,
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(PlotGreenSoft),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(20.dp))
            }
            Text(text = title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
            Text(text = desc, fontSize = 11.sp, color = PlotTextSecondary, lineHeight = 15.sp)
        }
    }
}

@Composable
fun FeaturedProjectCard(
    project: Project,
    onExplore: () -> Unit,
    onOpen3D: () -> Unit,
    onCheckGenuinity: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        border = BorderStroke(1.dp, PlotCardBorder)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                Image(
                    painter = painterResource(id = project.heroImageRes),
                    contentDescription = project.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Gradient
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.2f),
                                    Color.Black.copy(alpha = 0.6f)
                                )
                            )
                        )
                )

                // Top badges
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = PlotGreenPrimary
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                            Text("BMRDA Approved", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = PlotNavyDark.copy(alpha = 0.85f)
                    ) {
                        Text(
                            text = "${project.availablePlotsCount} Plots Available",
                            color = PlotGreenLight,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                // Bottom overlay info
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(12.dp)
                ) {
                    Text(
                        text = project.name,
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Default.Place, contentDescription = null, tint = PlotGreenLight, modifier = Modifier.size(14.dp))
                        Text(
                            text = project.location,
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 12.sp
                        )
                    }
                }
            }

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
                        Text(text = "Starting Price", fontSize = 11.sp, color = PlotTextMuted)
                        Text(
                            text = "₹${project.pricePerSqFt.toInt()}/sq.ft",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotGreenPrimary
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "Plot Sizes", fontSize = 11.sp, color = PlotTextMuted)
                        Text(
                            text = "1200 – 2400 sq.ft",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = PlotNavyDark
                        )
                    }
                }

                // Verification checks row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    FeatureBadge("Seller Evidence")
                    FeatureBadge("Docs Online")
                    FeatureBadge("Gov Link")
                }

                Divider(color = PlotCardBorder)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onExplore,
                        modifier = Modifier
                            .weight(1.2f)
                            .testTag("explore_project_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Explore Project", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = onOpen3D,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("open_3d_btn"),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, PlotGreenPrimary)
                    ) {
                        Icon(Icons.Default.ViewInAr, contentDescription = null, tint = PlotGreenPrimary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("3D View", fontSize = 12.sp, color = PlotGreenPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
