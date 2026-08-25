package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ProjectDocument
import com.example.model.VerificationStatus
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

@Composable
fun VerificationCenterScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val projects by viewModel.projects.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

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
            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(56.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text("Verification Audit Center", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
            Spacer(modifier = Modifier.height(8.dp))
            Text("No township selected for legal document audit. Add or select a project to verify approvals.", fontSize = 12.sp, color = PlotTextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Browse Marketplace")
            }
        }
        return
    }

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
                    color = PlotGreenSoft
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(16.dp))
                        Text("PlotFlow Genuinity & Evidence Audit", color = PlotGreenDark, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Text(
                    text = "Plot Verification Center",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Transparently reviewing ${project.name} (${project.location}) across 10 legal and on-ground pillars.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        // Trust Score & Seller Transparency
        item {
            TrustScoreMeter(score = project.developer.trustScore)
        }

        // Legal & UX Distinction Card
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "UNDERSTANDING EVIDENCE STAGES",
                        color = PlotGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    EvidenceStageRow("Document Uploaded", "Developer has uploaded digital scan of title/deed.", Color(0xFF94A3B8))
                    EvidenceStageRow("Source Provided", "Official state government verification URL linked.", Color(0xFF94A3B8))
                    EvidenceStageRow("Source Checked", "Cross-checked against state land records portal.", PlotBlueAccent)
                    EvidenceStageRow("Platform Reviewed", "Internal property compliance team audit complete.", PlotGold)
                    EvidenceStageRow("Professionally Verified", "Reviewed and signed off by empanelled legal advocate.", PlotGreenLight)
                }
            }
        }

        // 10 Verification Categories
        item {
            Text(
                text = "10 Verification Pillars",
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
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    PillarStatusRow(1, "Seller Identity Evidence", "Company registration, PAN, GST & authorized signatory credentials", VerificationStatus.VERIFIED)
                    PillarStatusRow(2, "Ownership / Title Chain", "30-year mother deed chain from 1994 to present with Nil Encumbrance", VerificationStatus.VERIFIED)
                    PillarStatusRow(3, "Layout / Development Approval", "BMRDA sanctioned master plan with official plan approval stamp", VerificationStatus.VERIFIED)
                    PillarStatusRow(4, "Land Conversion Information", "DC Conversion Order under Section 95 Karnataka Land Revenue Act", VerificationStatus.VERIFIED)
                    PillarStatusRow(5, "RERA Public Information", "RERA registration certificate on K-RERA official portal", VerificationStatus.VERIFIED)
                    PillarStatusRow(6, "Property Tax & E-Khata", "E-Khata extract and municipal property tax paid receipts", VerificationStatus.EVIDENCE_SUBMITTED)
                    PillarStatusRow(7, "Government Revenue Source", "Direct Bhoomi revenue land record survey link attached", VerificationStatus.VERIFIED)
                    PillarStatusRow(8, "Project Documents Repository", "Sanction layout, NOC from pollution board & fire services", VerificationStatus.VERIFIED)
                    PillarStatusRow(9, "Developer Track Record", "History of 8 delivered plotted communities in Bangalore", VerificationStatus.VERIFIED)
                    PillarStatusRow(10, "Platform Legal Review", "Independent audit by empanelled real estate advocates", VerificationStatus.VERIFIED)
                }
            }
        }

        // Verified Documents List
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Audited Document Evidence (${project.documents.size})",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
                Button(
                    onClick = { viewModel.openDocUploadDialog() },
                    colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Upload Doc", fontSize = 11.sp)
                }
            }
        }

        items(project.documents) { doc ->
            DocumentEvidenceCard(doc = doc)
        }

        // Government Source Links
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Official Government Source Links (${project.governmentSources.size})",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
                OutlinedButton(
                    onClick = { viewModel.openGovSourceDialog() },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.AddLink, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Source", fontSize = 11.sp)
                }
            }
        }

        items(project.governmentSources) { source ->
            Card(
                shape = RoundedCornerShape(10.dp),
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
                        Text(text = source.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = PlotNavyDark)
                        Surface(shape = RoundedCornerShape(4.dp), color = PlotGreenSoft) {
                            Text(text = source.status, color = PlotGreenDark, fontWeight = FontWeight.Bold, fontSize = 10.sp, modifier = Modifier.padding(4.dp))
                        }
                    }
                    Text(text = "Authority: ${source.authorityName}", fontSize = 12.sp, color = PlotTextSecondary)
                    Text(text = "Portal: ${source.portalName} • Last Checked: ${source.lastChecked}", fontSize = 11.sp, color = PlotTextMuted)
                    Text(text = "URL: ${source.url}", fontSize = 11.sp, color = PlotBlueAccent, fontWeight = FontWeight.Medium)
                }
            }
        }

        // Verification Audit Timeline
        item {
            Text(
                text = "Verification Audit Timeline",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = PlotNavyDark
            )
        }

        items(project.timeline) { event ->
            TimelineEventRow(event = event)
        }

        // Mandatory Legal Disclaimer
        item {
            LegalDisclaimerBanner()
        }
    }
}

@Composable
private fun EvidenceStageRow(title: String, desc: String, color: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color)
        )
        Column {
            Text(text = title, color = color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(text = desc, color = Color(0xFFCBD5E1), fontSize = 11.sp)
        }
    }
}

@Composable
private fun PillarStatusRow(
    index: Int,
    title: String,
    desc: String,
    status: VerificationStatus
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = "$index. $title", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
            Text(text = desc, fontSize = 11.sp, color = PlotTextSecondary)
        }
        Spacer(modifier = Modifier.width(8.dp))
        VerificationStatusChip(status = status)
    }
}

@Composable
private fun DocumentEvidenceCard(doc: ProjectDocument) {
    Card(
        shape = RoundedCornerShape(10.dp),
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = doc.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                    Text(text = "Category: ${doc.category.displayName}", fontSize = 11.sp, color = PlotGreenDark, fontWeight = FontWeight.Medium)
                }
                VerificationStatusChip(status = doc.status)
            }

            Text(text = "Digital Asset: ${doc.fileName}", fontSize = 11.sp, color = PlotBlueAccent)

            if (doc.notes != null) {
                Text(text = "Audit Note: ${doc.notes}", fontSize = 11.sp, color = PlotTextSecondary)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Uploaded: ${doc.uploadedDate} by ${doc.uploadedBy}", fontSize = 10.sp, color = PlotTextMuted)
                if (doc.reviewerName != null) {
                    Text(text = "Reviewer: ${doc.reviewerName}", fontSize = 10.sp, color = PlotNavyDark, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
private fun TimelineEventRow(event: com.example.model.TimelineEvent) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.Top
        ) {
            Surface(
                shape = CircleShape,
                color = PlotGreenSoft,
                modifier = Modifier.size(32.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(16.dp))
                }
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = event.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark)
                    Text(text = event.date, fontSize = 11.sp, color = PlotTextMuted)
                }
                Text(text = event.description, fontSize = 12.sp, color = PlotTextSecondary)
                Text(text = "Actor: ${event.actor}", fontSize = 10.sp, color = PlotNavyLight, fontWeight = FontWeight.Medium)
            }
        }
    }
}
