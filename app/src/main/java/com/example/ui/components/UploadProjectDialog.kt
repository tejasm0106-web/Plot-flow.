package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadProjectDialog(
    onDismiss: () -> Unit,
    onUpload: (
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
    ) -> Unit
) {
    var projectName by remember { mutableStateOf("") }
    var tagline by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Bengaluru") }
    var authority by remember { mutableStateOf("BMRDA Approved") }
    var reraNo by remember { mutableStateOf("PRM/KA/RERA/1250/303/PR/2026/00914") }
    var totalAcresText by remember { mutableStateOf("10.5") }
    var totalPlotsText by remember { mutableStateOf("20") }
    var pricePerSqFtText by remember { mutableStateOf("3250") }
    var description by remember { mutableStateOf("") }

    val availableAmenities = listOf(
        "40ft Wide Asphalt Roads",
        "Underground Cabling & LED Lighting",
        "24x7 Security & CCTV Surveillance",
        "Grand Clubhouse & Swimming Pool",
        "Landscaped Central Park & Kids Play Area",
        "Overhead Water Tank & STP",
        "Rainwater Harvesting"
    )

    var selectedAmenities by remember {
        mutableStateOf(setOf(
            "40ft Wide Asphalt Roads",
            "Underground Cabling & LED Lighting",
            "24x7 Security & CCTV Surveillance",
            "Landscaped Central Park & Kids Play Area"
        ))
    }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = PlotWhite,
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .testTag("upload_project_dialog")
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Dialog Header
                Surface(
                    color = PlotNavyDark,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = PlotGold
                            ) {
                                Box(modifier = Modifier.padding(4.dp)) {
                                    Icon(Icons.Default.CloudUpload, contentDescription = null, tint = PlotNavyDark, modifier = Modifier.size(18.dp))
                                }
                            }
                            Column {
                                Text(
                                    text = "Upload New Layout Project",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = Color.White
                                )
                                Text(
                                    text = "Publishes live to Buyer Marketplace with 3D Twin",
                                    fontSize = 11.sp,
                                    color = PlotGold
                                )
                            }
                        }

                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                    }
                }

                // Scrollable Form Body
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Quick Auto-fill button for quick testing
                    item {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = PlotGreenSoft,
                            border = BorderStroke(1.dp, PlotGreenPrimary.copy(alpha = 0.3f)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    projectName = "Palm Grove Plotted Eco-Township"
                                    tagline = "BMRDA & RERA Approved Luxury Villa Plots on Airport Corridor"
                                    location = "Devanahalli Extension"
                                    city = "Bengaluru"
                                    authority = "BMRDA & DTCP Approved"
                                    reraNo = "PRM/KA/RERA/1250/303/PR/2026/00742"
                                    totalAcresText = "12.0"
                                    totalPlotsText = "20"
                                    pricePerSqFtText = "3400"
                                    description = "Palm Grove is an expansive 12-acre gated plotted community featuring 40ft tree-lined boulevards, 100% legal title clearance, Bhoomi RTC records, and dedicated clubhouse."
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.AutoFixHigh, contentDescription = null, tint = PlotGreenDark, modifier = Modifier.size(18.dp))
                                Text(
                                    text = "1-Tap Fill Sample Plotted Layout Data",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PlotGreenDark
                                )
                            }
                        }
                    }

                    // Project Name
                    item {
                        OutlinedTextField(
                            value = projectName,
                            onValueChange = { projectName = it },
                            label = { Text("Layout / Project Name *") },
                            placeholder = { Text("e.g. Royal Meadows Enclave") },
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // Tagline
                    item {
                        OutlinedTextField(
                            value = tagline,
                            onValueChange = { tagline = it },
                            label = { Text("Project Tagline / Highlights") },
                            placeholder = { Text("e.g. BMRDA Approved Plots Near Upcoming Metro") },
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // Location & City
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = location,
                                onValueChange = { location = it },
                                label = { Text("Location / Micro-Market *") },
                                placeholder = { Text("e.g. Devanahalli") },
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1.2f)
                            )
                            OutlinedTextField(
                                value = city,
                                onValueChange = { city = it },
                                label = { Text("City") },
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(0.8f)
                            )
                        }
                    }

                    // Approval Authority & RERA
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = authority,
                                onValueChange = { authority = it },
                                label = { Text("Approval Authority *") },
                                placeholder = { Text("e.g. BMRDA Approved") },
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = reraNo,
                                onValueChange = { reraNo = it },
                                label = { Text("RERA Number") },
                                placeholder = { Text("PRM/KA/RERA...") },
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Layout Dimensions & Rate
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = totalAcresText,
                                onValueChange = { totalAcresText = it },
                                label = { Text("Acres") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = totalPlotsText,
                                onValueChange = { totalPlotsText = it },
                                label = { Text("Total Plots") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = pricePerSqFtText,
                                onValueChange = { pricePerSqFtText = it },
                                label = { Text("₹ / Sq.Ft *") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1.2f)
                            )
                        }
                    }

                    // Description
                    item {
                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            label = { Text("Project Description") },
                            placeholder = { Text("Detailed masterplan summary, road widths, water supply, security...") },
                            minLines = 3,
                            maxLines = 5,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // Amenities Checkboxes
                    item {
                        Text(
                            text = "Infrastructure & Amenities Included",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = PlotNavyDark
                        )
                    }

                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            availableAmenities.forEach { amenity ->
                                val isChecked = selectedAmenities.contains(amenity)
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            selectedAmenities = if (isChecked) {
                                                selectedAmenities - amenity
                                            } else {
                                                selectedAmenities + amenity
                                            }
                                        }
                                        .padding(vertical = 2.dp)
                                ) {
                                    Checkbox(
                                        checked = isChecked,
                                        onCheckedChange = { checked ->
                                            selectedAmenities = if (checked) {
                                                selectedAmenities + amenity
                                            } else {
                                                selectedAmenities - amenity
                                            }
                                        },
                                        colors = CheckboxDefaults.colors(checkedColor = PlotGreenPrimary)
                                    )
                                    Text(text = amenity, fontSize = 12.sp, color = PlotNavyDark)
                                }
                            }
                        }
                    }

                    // Error text if validation fails
                    if (errorMessage != null) {
                        item {
                            Text(
                                text = errorMessage ?: "",
                                color = PlotRed,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Footer Actions
                Divider(color = PlotCardBorder)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel", color = PlotNavyDark)
                    }

                    Button(
                        onClick = {
                            if (projectName.isBlank() || location.isBlank()) {
                                errorMessage = "Please enter Project Name and Location."
                                return@Button
                            }
                            val price = pricePerSqFtText.toDoubleOrNull() ?: 3000.0
                            val acres = totalAcresText.toDoubleOrNull() ?: 10.0
                            val plots = totalPlotsText.toIntOrNull() ?: 20

                            onUpload(
                                projectName,
                                tagline,
                                location,
                                city,
                                authority,
                                reraNo,
                                acres,
                                plots,
                                price,
                                description,
                                selectedAmenities.toList()
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .weight(1.5f)
                            .testTag("submit_upload_project_btn")
                    ) {
                        Icon(Icons.Default.Publish, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Publish & Launch", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
