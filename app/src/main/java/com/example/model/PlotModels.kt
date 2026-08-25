package com.example.model

enum class UserRole(val displayName: String) {
    BUYER("Buyer / Investor"),
    DEVELOPER("Developer / Builder"),
    ADMIN("App Owner / Super Admin")
}

data class PlatformSettings(
    val platformFeePercent: Double = 1.5,
    val isMaintenanceMode: Boolean = false,
    val autoApproveNewProjects: Boolean = false,
    val reraVerificationEnforced: Boolean = true,
    val broadcastMessage: String = "Welcome to PlotFlow — India's 1st Verified 3D Plotted Land Marketplace",
    val supportEmail: String = "owner@plotflow.in",
    val supportPhone: String = "+91 98450 00001"
)

data class AppUser(
    val uid: String,
    val email: String,
    val displayName: String,
    val role: UserRole,
    val companyName: String? = null,
    val roleTitle: String? = null,
    val phone: String? = null,
    val isVerifiedDeveloper: Boolean = false
)

data class DeveloperUser(
    val userId: String,
    val name: String,
    val companyName: String,
    val email: String,
    val roleTitle: String,
    val verifiedBadge: Boolean = true
)

enum class PlotStatus(val displayName: String) {
    AVAILABLE("Available"),
    RESERVED("Reserved"),
    SOLD("Sold")
}

enum class VerificationStatus(val label: String) {
    VERIFIED("Verified"),
    UNDER_REVIEW("Under Review"),
    EVIDENCE_SUBMITTED("Evidence Submitted"),
    NOT_AVAILABLE("Not Available")
}

enum class DocCategory(val displayName: String) {
    TITLE_DEED("Title / Ownership"),
    MOTHER_DEED("Mother Deed"),
    SALE_DEED("Sale Deed"),
    KHATA_RECORD("Khata / Property Record"),
    TAX_RECEIPT("Tax Receipt"),
    LAYOUT_APPROVAL("Layout Approval"),
    DEVELOPMENT_APPROVAL("Development Approval"),
    CONVERSION_ORDER("Land Conversion Order"),
    RERA_DOCUMENT("RERA Certificate"),
    COMPANY_REGISTRATION("Company Registration"),
    PAN_GST("PAN & GST Evidence"),
    IDENTITY_DOCS("Seller Identity Proof")
}

enum class LeadStage(val label: String) {
    NEW("New Lead"),
    CONTACTED("Contacted"),
    SITE_VISIT("Site Visit Scheduled"),
    NEGOTIATION("Negotiation"),
    BOOKING("Booking Initiated"),
    CLOSED("Closed / Won")
}

data class Plot(
    val id: String,
    val projectId: String,
    val plotNumber: String,
    val sizeSqFt: Int,
    val dimensions: String,
    val facing: String,
    val roadWidth: String,
    val pricePerSqFt: Double,
    val status: PlotStatus,
    val isCornerPlot: Boolean = false,
    val isParkFacing: Boolean = false,
    val gridRow: Int = 0,
    val gridCol: Int = 0,
    val previewImageRes: Int? = null,
    val notes: String = ""
) {
    val totalPrice: Double
        get() = sizeSqFt * pricePerSqFt

    val formattedPrice: String
        get() {
            val total = totalPrice
            return if (total >= 10000000) {
                String.format("₹%.2f Cr", total / 10000000)
            } else if (total >= 100000) {
                String.format("₹%.2f L", total / 100000)
            } else {
                String.format("₹%,.0f", total)
            }
        }
}

data class ProjectDocument(
    val id: String,
    val category: DocCategory,
    val title: String,
    val fileName: String,
    val uploadedDate: String,
    val uploadedBy: String,
    val status: VerificationStatus,
    val reviewerName: String? = null,
    val verifiedDate: String? = null,
    val sourceUrl: String? = null,
    val notes: String? = null,
    val isDemo: Boolean = true
)

data class GovernmentSource(
    val id: String,
    val title: String,
    val portalName: String,
    val url: String,
    val authorityName: String,
    val dateAdded: String,
    val lastChecked: String,
    val status: String = "Source Linked",
    val isDemo: Boolean = true
)

data class TimelineEvent(
    val id: String,
    val date: String,
    val title: String,
    val description: String,
    val actor: String,
    val isVerifiedStep: Boolean = true
)

data class SellerProfile(
    val id: String,
    val companyName: String,
    val tagLine: String,
    val establishedYear: Int,
    val completedProjectsCount: Int,
    val activeProjectsCount: Int,
    val reraRegistrationNo: String,
    val businessAddress: String,
    val phone: String,
    val email: String,
    val trustScore: Int, // 0 to 100
    val identityVerified: Boolean = true,
    val companyDocsVerified: Boolean = true,
    val sourceTransparencyScore: Int = 90,
    val reviewRating: Float = 4.8f,
    val reviewCount: Int = 34
)

data class Project(
    val id: String,
    val name: String,
    val tagline: String,
    val location: String,
    val city: String,
    val developer: SellerProfile,
    val totalAcres: Double,
    val totalPlots: Int,
    val availablePlotsCount: Int,
    val pricePerSqFt: Double,
    val startingPriceText: String,
    val roadWidths: String,
    val reraNumber: String,
    val possessionStatus: String,
    val heroImageRes: Int,
    val masterplanImageRes: Int,
    val clubhouseImageRes: Int,
    val villaPreviewImageRes: Int,
    val description: String,
    val amenities: List<String>,
    val surroundings: List<String>,
    val documents: List<ProjectDocument>,
    val governmentSources: List<GovernmentSource>,
    val timeline: List<TimelineEvent>,
    val has3DModel: Boolean = true,
    val approvalAuthority: String = "BMRDA & DTCP Approved"
) {
    val isReraApproved: Boolean
        get() = reraNumber.isNotBlank() && !reraNumber.contains("Pending", ignoreCase = true)
}

data class Lead(
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val interestedPlotNumber: String,
    val projectName: String,
    val budget: String,
    val stage: LeadStage,
    val source: String,
    val lastContacted: String,
    val nextFollowUp: String,
    val notes: String
)

data class SiteVisitBooking(
    val id: String,
    val name: String,
    val phone: String,
    val projectName: String,
    val plotNumber: String,
    val visitDate: String,
    val timeSlot: String,
    val visitorsCount: Int,
    val needPickup: Boolean,
    val pickupAddress: String = "",
    val status: String = "Confirmed",
    val bookedAt: String
)

data class ReviewItem(
    val id: String,
    val author: String,
    val plotBought: String,
    val rating: Float,
    val date: String,
    val comment: String,
    val isVerifiedBuyer: Boolean = true
)
