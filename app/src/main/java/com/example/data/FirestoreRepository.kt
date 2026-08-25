package com.example.data

import android.util.Log
import com.example.model.*
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * FirestoreRepository provides Cloud Firestore persistence for:
 * 1. User Roles & Profiles (users collection)
 * 2. Plotted Township Projects (projects collection)
 * 3. Plot Inventory & Live Availability (plots subcollection / collection)
 * 4. CRM Leads & Site Visit Bookings
 */
class FirestoreRepository {

    private val tag = "FirestoreRepository"

    private val firestore: FirebaseFirestore? = try {
        FirebaseFirestore.getInstance()
    } catch (e: Exception) {
        Log.w(tag, "Firestore not initialized or offline: ${e.message}")
        null
    }

    // ==========================================
    // 1. USER ROLES & PROFILES REPOSITORY
    // ==========================================

    suspend fun saveUserRoleAndProfile(user: AppUser): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit) // Offline fallback
            val userMap = hashMapOf(
                "uid" to user.uid,
                "email" to user.email,
                "displayName" to user.displayName,
                "role" to user.role.name,
                "companyName" to (user.companyName ?: ""),
                "roleTitle" to (user.roleTitle ?: ""),
                "phone" to (user.phone ?: ""),
                "isVerifiedDeveloper" to user.isVerifiedDeveloper,
                "updatedAt" to System.currentTimeMillis()
            )
            db.collection("users").document(user.uid)
                .set(userMap, SetOptions.merge())
                .await()
            Log.d(tag, "User role and profile saved for uid: ${user.uid}")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving user role in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun getUserProfile(uid: String): Result<AppUser?> {
        return try {
            val db = firestore ?: return Result.success(null)
            val doc = db.collection("users").document(uid).get().await()
            if (doc.exists()) {
                val data = doc.data ?: return Result.success(null)
                val roleStr = data["role"] as? String ?: UserRole.BUYER.name
                val role = try { UserRole.valueOf(roleStr) } catch (_: Exception) { UserRole.BUYER }
                val user = AppUser(
                    uid = data["uid"] as? String ?: uid,
                    email = data["email"] as? String ?: "",
                    displayName = data["displayName"] as? String ?: "",
                    role = role,
                    companyName = (data["companyName"] as? String)?.ifEmpty { null },
                    roleTitle = (data["roleTitle"] as? String)?.ifEmpty { null },
                    phone = (data["phone"] as? String)?.ifEmpty { null },
                    isVerifiedDeveloper = data["isVerifiedDeveloper"] as? Boolean ?: (role == UserRole.DEVELOPER)
                )
                Result.success(user)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Log.e(tag, "Error retrieving user profile from Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    fun observeUser(uid: String): Flow<AppUser?> = callbackFlow {
        val db = firestore
        if (db == null) {
            trySend(null)
            close()
            return@callbackFlow
        }
        val registration = db.collection("users").document(uid)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(tag, "Observe user listen failed: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null && snapshot.exists()) {
                    val data = snapshot.data ?: return@addSnapshotListener
                    val roleStr = data["role"] as? String ?: UserRole.BUYER.name
                    val role = try { UserRole.valueOf(roleStr) } catch (_: Exception) { UserRole.BUYER }
                    val user = AppUser(
                        uid = data["uid"] as? String ?: uid,
                        email = data["email"] as? String ?: "",
                        displayName = data["displayName"] as? String ?: "",
                        role = role,
                        companyName = (data["companyName"] as? String)?.ifEmpty { null },
                        roleTitle = (data["roleTitle"] as? String)?.ifEmpty { null },
                        phone = (data["phone"] as? String)?.ifEmpty { null },
                        isVerifiedDeveloper = data["isVerifiedDeveloper"] as? Boolean ?: (role == UserRole.DEVELOPER)
                    )
                    trySend(user)
                } else {
                    trySend(null)
                }
            }
        awaitClose { registration.remove() }
    }

    // ==========================================
    // 2. PROJECTS REPOSITORY
    // ==========================================

    suspend fun saveProject(project: Project): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            val projectMap = hashMapOf(
                "id" to project.id,
                "name" to project.name,
                "tagline" to project.tagline,
                "location" to project.location,
                "city" to project.city,
                "totalAcres" to project.totalAcres,
                "totalPlots" to project.totalPlots,
                "availablePlotsCount" to project.availablePlotsCount,
                "pricePerSqFt" to project.pricePerSqFt,
                "startingPriceText" to project.startingPriceText,
                "roadWidths" to project.roadWidths,
                "reraNumber" to project.reraNumber,
                "possessionStatus" to project.possessionStatus,
                "description" to project.description,
                "amenities" to project.amenities,
                "surroundings" to project.surroundings,
                "approvalAuthority" to project.approvalAuthority,
                "has3DModel" to project.has3DModel,
                "sellerCompanyName" to project.developer.companyName,
                "sellerTagLine" to project.developer.tagLine,
                "sellerEstablishedYear" to project.developer.establishedYear,
                "sellerRera" to project.developer.reraRegistrationNo,
                "sellerAddress" to project.developer.businessAddress,
                "sellerPhone" to project.developer.phone,
                "sellerEmail" to project.developer.email,
                "sellerTrustScore" to project.developer.trustScore,
                "updatedAt" to System.currentTimeMillis()
            )
            db.collection("projects").document(project.id)
                .set(projectMap, SetOptions.merge())
                .await()
            Log.d(tag, "Project saved in Firestore: ${project.id}")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving project in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun deleteProject(projectId: String): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            // Delete all plots in subcollection
            val plotsSnapshot = db.collection("projects").document(projectId).collection("plots").get().await()
            val batch = db.batch()
            for (doc in plotsSnapshot.documents) {
                batch.delete(doc.reference)
            }
            batch.delete(db.collection("projects").document(projectId))
            batch.commit().await()
            Log.d(tag, "Project $projectId and associated plots deleted from Firestore")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error deleting project $projectId from Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun deletePlot(projectId: String, plotId: String): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            db.collection("projects").document(projectId)
                .collection("plots").document(plotId)
                .delete()
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error deleting plot $plotId in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    // ==========================================
    // 3. PLOT INVENTORY REPOSITORY
    // ==========================================

    suspend fun savePlot(plot: Plot): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            val plotMap = hashMapOf(
                "id" to plot.id,
                "projectId" to plot.projectId,
                "plotNumber" to plot.plotNumber,
                "sizeSqFt" to plot.sizeSqFt,
                "dimensions" to plot.dimensions,
                "facing" to plot.facing,
                "roadWidth" to plot.roadWidth,
                "pricePerSqFt" to plot.pricePerSqFt,
                "status" to plot.status.name,
                "isCornerPlot" to plot.isCornerPlot,
                "isParkFacing" to plot.isParkFacing,
                "gridRow" to plot.gridRow,
                "gridCol" to plot.gridCol,
                "notes" to plot.notes,
                "updatedAt" to System.currentTimeMillis()
            )
            db.collection("projects").document(plot.projectId)
                .collection("plots").document(plot.id)
                .set(plotMap, SetOptions.merge())
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving plot in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun savePlots(projectId: String, plots: List<Plot>): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            val batch = db.batch()
            for (plot in plots) {
                val docRef = db.collection("projects").document(projectId)
                    .collection("plots").document(plot.id)
                val plotMap = hashMapOf(
                    "id" to plot.id,
                    "projectId" to plot.projectId,
                    "plotNumber" to plot.plotNumber,
                    "sizeSqFt" to plot.sizeSqFt,
                    "dimensions" to plot.dimensions,
                    "facing" to plot.facing,
                    "roadWidth" to plot.roadWidth,
                    "pricePerSqFt" to plot.pricePerSqFt,
                    "status" to plot.status.name,
                    "isCornerPlot" to plot.isCornerPlot,
                    "isParkFacing" to plot.isParkFacing,
                    "gridRow" to plot.gridRow,
                    "gridCol" to plot.gridCol,
                    "notes" to plot.notes,
                    "updatedAt" to System.currentTimeMillis()
                )
                batch.set(docRef, plotMap, SetOptions.merge())
            }
            batch.commit().await()
            Log.d(tag, "Batch saved ${plots.size} plots for project: $projectId")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving plot batch in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun updatePlotStatus(projectId: String, plotId: String, status: PlotStatus): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            db.collection("projects").document(projectId)
                .collection("plots").document(plotId)
                .update(
                    mapOf(
                        "status" to status.name,
                        "updatedAt" to System.currentTimeMillis()
                    )
                ).await()
            Log.d(tag, "Plot $plotId status updated to $status in Firestore")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error updating plot status in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    fun observePlotsForProject(projectId: String): Flow<List<Plot>> = callbackFlow {
        val db = firestore
        if (db == null) {
            trySend(emptyList())
            close()
            return@callbackFlow
        }
        val registration = db.collection("projects").document(projectId)
            .collection("plots")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(tag, "Observe plots listen failed: ${error.message}")
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val plots = snapshot.documents.mapNotNull { doc ->
                        val data = doc.data ?: return@mapNotNull null
                        val statusStr = data["status"] as? String ?: PlotStatus.AVAILABLE.name
                        val status = try { PlotStatus.valueOf(statusStr) } catch (_: Exception) { PlotStatus.AVAILABLE }
                        Plot(
                            id = data["id"] as? String ?: doc.id,
                            projectId = data["projectId"] as? String ?: projectId,
                            plotNumber = data["plotNumber"] as? String ?: "",
                            sizeSqFt = (data["sizeSqFt"] as? Number)?.toInt() ?: 1200,
                            dimensions = data["dimensions"] as? String ?: "30' x 40'",
                            facing = data["facing"] as? String ?: "East",
                            roadWidth = data["roadWidth"] as? String ?: "40 ft",
                            pricePerSqFt = (data["pricePerSqFt"] as? Number)?.toDouble() ?: 3800.0,
                            status = status,
                            isCornerPlot = data["isCornerPlot"] as? Boolean ?: false,
                            isParkFacing = data["isParkFacing"] as? Boolean ?: false,
                            gridRow = (data["gridRow"] as? Number)?.toInt() ?: 0,
                            gridCol = (data["gridCol"] as? Number)?.toInt() ?: 0,
                            notes = data["notes"] as? String ?: ""
                        )
                    }
                    trySend(plots)
                }
            }
        awaitClose { registration.remove() }
    }

    // ==========================================
    // 4. CRM LEADS & SITE VISITS
    // ==========================================

    suspend fun saveLead(lead: Lead): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            val leadMap = hashMapOf(
                "id" to lead.id,
                "name" to lead.name,
                "phone" to lead.phone,
                "email" to lead.email,
                "interestedPlotNumber" to lead.interestedPlotNumber,
                "projectName" to lead.projectName,
                "budget" to lead.budget,
                "stage" to lead.stage.name,
                "source" to lead.source,
                "lastContacted" to lead.lastContacted,
                "nextFollowUp" to lead.nextFollowUp,
                "notes" to lead.notes,
                "createdAt" to System.currentTimeMillis()
            )
            db.collection("leads").document(lead.id)
                .set(leadMap, SetOptions.merge())
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving lead in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun saveSiteVisit(booking: SiteVisitBooking): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            val bookingMap = hashMapOf(
                "id" to booking.id,
                "projectName" to booking.projectName,
                "plotNumber" to booking.plotNumber,
                "name" to booking.name,
                "phone" to booking.phone,
                "visitDate" to booking.visitDate,
                "timeSlot" to booking.timeSlot,
                "visitorsCount" to booking.visitorsCount,
                "needPickup" to booking.needPickup,
                "pickupAddress" to booking.pickupAddress,
                "status" to booking.status,
                "bookedAt" to booking.bookedAt,
                "createdAt" to System.currentTimeMillis()
            )
            db.collection("site_visits").document(booking.id)
                .set(bookingMap, SetOptions.merge())
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving site visit in Firestore: ${e.message}", e)
            Result.failure(e)
        }
    }

    // ==========================================
    // 5. PLATFORM SETTINGS (APP OWNER CONFIG)
    // ==========================================

    suspend fun savePlatformSettings(settings: PlatformSettings): Result<Unit> {
        return try {
            val db = firestore ?: return Result.success(Unit)
            val settingsMap = hashMapOf(
                "platformFeePercent" to settings.platformFeePercent,
                "isMaintenanceMode" to settings.isMaintenanceMode,
                "autoApproveNewProjects" to settings.autoApproveNewProjects,
                "reraVerificationEnforced" to settings.reraVerificationEnforced,
                "broadcastMessage" to settings.broadcastMessage,
                "supportEmail" to settings.supportEmail,
                "supportPhone" to settings.supportPhone,
                "updatedAt" to System.currentTimeMillis()
            )
            db.collection("platform_config").document("general")
                .set(settingsMap, SetOptions.merge())
                .await()
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(tag, "Error saving platform settings: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun getPlatformSettings(): Result<PlatformSettings?> {
        return try {
            val db = firestore ?: return Result.success(null)
            val snapshot = db.collection("platform_config").document("general").get().await()
            if (snapshot.exists()) {
                val settings = PlatformSettings(
                    platformFeePercent = snapshot.getDouble("platformFeePercent") ?: 1.5,
                    isMaintenanceMode = snapshot.getBoolean("isMaintenanceMode") ?: false,
                    autoApproveNewProjects = snapshot.getBoolean("autoApproveNewProjects") ?: false,
                    reraVerificationEnforced = snapshot.getBoolean("reraVerificationEnforced") ?: true,
                    broadcastMessage = snapshot.getString("broadcastMessage") ?: "Welcome to PlotFlow — India's 1st Verified 3D Plotted Land Marketplace",
                    supportEmail = snapshot.getString("supportEmail") ?: "owner@plotflow.in",
                    supportPhone = snapshot.getString("supportPhone") ?: "+91 98450 00001"
                )
                Result.success(settings)
            } else {
                Result.success(null)
            }
        } catch (e: Exception) {
            Log.e(tag, "Error getting platform settings: ${e.message}", e)
            Result.failure(e)
        }
    }
}

