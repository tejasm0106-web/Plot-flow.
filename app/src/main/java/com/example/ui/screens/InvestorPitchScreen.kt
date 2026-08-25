package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.viewmodel.PlotFlowViewModel

@Composable
fun InvestorPitchScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = PlotNavyDark
                ) {
                    Text(
                        text = "INVESTOR & PRODUCT DECK",
                        color = PlotGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Text(
                    text = "PlotFlow: The Plotted Real-Estate OS",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Transforming the opaque $40B Indian residential land & plotted development market through 3D twins, verified evidence, and developer SaaS.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        // Problem vs Solution Card
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("The Massive Market Inefficiency", color = PlotGold, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    ProblemPoint("1. Fragmented & Blind Buying", "Buyers travel 40km to empty dirt plots with zero spatial perception or villa imagination.")
                    ProblemPoint("2. Title Fraud & Opaque Legals", "70% of land litigation stems from disputed 30-year mother deed chains and unverified conversions.")
                    ProblemPoint("3. Primitive Developer Tools", "Plot developers manage ₹100Cr inventory on manual Excel sheets and static WhatsApp brochures.")

                    Divider(color = PlotNavyLight)

                    Text("The PlotFlow Solution", color = PlotGreenLight, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    SolutionPoint("✓ 3D Digital Twin Engine", "Interactive 3D masterplans with live plot boundaries, villa concepts and road frontage.")
                    SolutionPoint("✓ 10-Point Evidence Center", "Digitized 30-year title audit, RERA compliance & Bhoomi government revenue links.")
                    SolutionPoint("✓ Full-Stack Developer SaaS", "Live inventory sync, CRM lead pipelines, site visit fleet passes, and analytics.")
                }
            }
        }

        // SaaS Pricing Tiers
        item {
            Text(
                text = "Developer SaaS Subscription Tiers",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = PlotNavyDark
            )
        }

        item {
            PricingTierCard(
                title = "Starter Plan",
                price = "₹999",
                period = "/ project / month",
                tag = "Single Layouts",
                features = listOf(
                    "Live 2D demarcated plot inventory",
                    "Status sync (Available / Reserved / Sold)",
                    "Basic lead management CRM",
                    "WhatsApp lead notification alerts"
                ),
                isPopular = false,
                onChoose = { viewModel.showNotification("Starter plan selected.") }
            )
        }

        item {
            PricingTierCard(
                title = "Growth Plan",
                price = "₹2,499",
                period = "/ project / month",
                tag = "Most Popular",
                features = listOf(
                    "Everything in Starter Plan",
                    "Interactive 3D Digital Twin masterplan",
                    "Document & Title evidence repository",
                    "Site visit booking engine with automated pass",
                    "Custom branding & sub-domain link"
                ),
                isPopular = true,
                onChoose = { viewModel.showNotification("Growth plan selected.") }
            )
        }

        item {
            PricingTierCard(
                title = "Pro Plan",
                price = "₹4,999",
                period = "/ project / month",
                tag = "Gated Enclaves",
                features = listOf(
                    "Everything in Growth Plan",
                    "Plot-specific 3D villa concept generator",
                    "Government Bhoomi/Kaveri direct verification integration",
                    "Multi-agent sales CRM with lead assignment",
                    "Drone 360° point cloud visualization"
                ),
                isPopular = false,
                onChoose = { viewModel.showNotification("Pro plan selected.") }
            )
        }

        item {
            PricingTierCard(
                title = "Enterprise Plan",
                price = "₹9,999+",
                period = "/ month (Custom)",
                tag = "Top Tier Developers",
                features = listOf(
                    "Multi-township unlimited inventory",
                    "White-label buyer portal & dedicated app",
                    "Dedicated platform legal advocate verification audit",
                    "ERP & payment gateway token booking API integration"
                ),
                isPopular = false,
                onChoose = { viewModel.showNotification("Enterprise inquiry recorded.") }
            )
        }

        // Product Roadmap
        item {
            Text(
                text = "Product Roadmap & Expansion",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = PlotNavyDark
            )
        }

        item {
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
                    RoadmapPhase("Phase 1: Core Foundation (Current)", "Interactive 3D masterplan, 2D demarcated layout, 10-point verification center, live inventory sync, and lead CRM.")
                    RoadmapPhase("Phase 2: Spatial & Drone Engine (Q4 2026)", "WebAssembly/ThreeJS 3D GLTF asset rendering, solar shadow simulation, drone point cloud scans, and AR on-site boundary walk.")
                    RoadmapPhase("Phase 3: Automated Legal AI & Revenue APIs (Q1 2027)", "Direct API connectors to Bhoomi, Kaveri, and Dharani state portals with AI-assisted title deed anomaly detection.")
                    RoadmapPhase("Phase 4: Token Booking & Escrow (Q3 2027)", "Online digital plot token reservations, integrated escrow bank payments, and digital agreement stamping.")
                }
            }
        }
    }
}

@Composable
private fun ProblemPoint(title: String, desc: String) {
    Column {
        Text(title, color = PlotRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(desc, color = Color(0xFFCBD5E1), fontSize = 11.sp)
    }
}

@Composable
private fun SolutionPoint(title: String, desc: String) {
    Column {
        Text(title, color = PlotGreenLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(desc, color = Color(0xFFCBD5E1), fontSize = 11.sp)
    }
}

@Composable
private fun PricingTierCard(
    title: String,
    price: String,
    period: String,
    tag: String,
    features: List<String>,
    isPopular: Boolean,
    onChoose: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (isPopular) PlotNavyDark else PlotWhite),
        border = BorderStroke(if (isPopular) 2.dp else 1.dp, if (isPopular) PlotGreenPrimary else PlotCardBorder),
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
                    Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = if (isPopular) Color.White else PlotNavyDark)
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(text = price, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = if (isPopular) PlotGreenLight else PlotGreenPrimary)
                        Text(text = period, fontSize = 11.sp, color = if (isPopular) Color(0xFF94A3B8) else PlotTextMuted, modifier = Modifier.padding(bottom = 3.dp, start = 4.dp))
                    }
                }
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = if (isPopular) PlotGreenPrimary else PlotGreenSoft
                ) {
                    Text(
                        text = tag,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isPopular) Color.White else PlotGreenDark,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Divider(color = if (isPopular) PlotNavyLight else PlotCardBorder)

            features.forEach { feat ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = if (isPopular) PlotGreenLight else PlotGreenPrimary,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(text = feat, fontSize = 12.sp, color = if (isPopular) Color(0xFFCBD5E1) else PlotNavyDark)
                }
            }

            Button(
                onClick = onChoose,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = if (isPopular) PlotGreenPrimary else PlotNavyDark),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(text = "Select $title", fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun RoadmapPhase(phase: String, desc: String) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(text = phase, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotGreenDark)
        Text(text = desc, fontSize = 11.sp, color = PlotTextSecondary)
    }
}
