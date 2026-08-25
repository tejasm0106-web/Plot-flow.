package com.example.data

import com.example.model.AppUser
import com.example.model.DeveloperUser
import com.example.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.tasks.await

class FirebaseAuthService {

    private val auth: FirebaseAuth? = try {
        FirebaseAuth.getInstance()
    } catch (e: Exception) {
        null
    }

    val currentFirebaseUser: FirebaseUser?
        get() = auth?.currentUser

    suspend fun signIn(email: String, pass: String): Result<FirebaseUser?> {
        val trimmedEmail = email.trim()
        val trimmedPass = pass.trim()

        if (trimmedEmail.isEmpty() || trimmedPass.isEmpty()) {
            return Result.failure(IllegalArgumentException("Email and password cannot be empty."))
        }

        return try {
            if (auth != null) {
                val authResult = auth.signInWithEmailAndPassword(trimmedEmail, trimmedPass).await()
                Result.success(authResult.user)
            } else {
                // Safe offline fallback
                Result.success(null)
            }
        } catch (e: Exception) {
            // If Firebase user does not exist on remote or network fails, provide graceful message or fallback
            Result.failure(e)
        }
    }

    suspend fun signUp(email: String, pass: String): Result<FirebaseUser?> {
        val trimmedEmail = email.trim()
        val trimmedPass = pass.trim()

        if (trimmedEmail.isEmpty() || trimmedPass.isEmpty()) {
            return Result.failure(IllegalArgumentException("Email and password cannot be empty."))
        }

        if (trimmedPass.length < 6) {
            return Result.failure(IllegalArgumentException("Password must be at least 6 characters."))
        }

        return try {
            if (auth != null) {
                val authResult = auth.createUserWithEmailAndPassword(trimmedEmail, trimmedPass).await()
                Result.success(authResult.user)
            } else {
                // Safe offline fallback
                Result.success(null)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun signOut() {
        try {
            auth?.signOut()
        } catch (_: Exception) {}
    }
}
