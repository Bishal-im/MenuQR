"use server";

import { connectToDatabase } from "@/lib/db";
import { UserModel, OTPModel, RestaurantModel } from "@/models/Schemas";
import { sendEmail } from "@/lib/emailer";
import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'superadmin' | 'admin' | 'waiter' | 'customer';
  restaurantId?: string;
  restaurantName?: string;
}

export interface UserSyncData {
  email: string;
  name?: string;
  requestedRole?: AuthUser['role'];
}

export async function requestOTP(email: string) {
  try {
    await connectToDatabase();
    const normalizedEmail = email.toLowerCase();
    
    // Generate code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to MongoDB with TTL (will overwrite any existing OTP for this email)
    await OTPModel.deleteMany({ email: normalizedEmail }); // Clear previous OTPs
    await OTPModel.create({ email: normalizedEmail, otp });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f97316; text-align: center;">MenuQR Security Code</h2>
        <p>Hello,</p>
        <p>Your verification code for logging in to your MenuQR account is:</p>
        <div style="background: #fff7ed; padding: 20px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ea580c; border: 2px dashed #fdba74; margin: 20px 0;">
          ${otp}
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">This code will expire in <strong>2 minutes</strong>.</p>
        <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">&copy; 2026 MenuQR Platform • Secure Restaurant Solutions</p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: `MenuQR Code: ${otp}`,
      html: emailHtml,
    });

    if (result.success) {
      console.log(`[AUTH] OTP Sent to ${email}. Code: ${otp}`);
      return { success: true };
    } else {
      return { success: false, error: "Email delivery failed." };
    }
  } catch (error: any) {
    console.error("[AUTH] Request OTP Error:", error.message);
    return { success: false, error: "Internal server error." };
  }
}

export async function verifyOTP(email: string, otp: string, requestedRole?: AuthUser['role']) {
  try {
    await connectToDatabase();
    const normalizedEmail = email.toLowerCase();
    
    const otpRecord = await OTPModel.findOne({ email: normalizedEmail, otp });
    
    if (!otpRecord) {
      return { success: false, error: "Invalid or expired verification code." };
    }

    // OTP is valid, remove it immediately
    await OTPModel.deleteOne({ _id: otpRecord._id });

    // Sync user and create session
    const syncResult = await syncUser({ email, requestedRole });
    
    if (syncResult.success && syncResult.user) {
      const user = syncResult.user;
      // Use the role returned by syncUser (which respects requestedRole if authorized)
      const sessionToken = JSON.stringify(user);
      const cookieName = `menu_qr_${user.role}_session`;
      
      const cookieStore = await cookies();
      cookieStore.set(cookieName, sessionToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60, // 1 week
        path: "/",
      });

      return { success: true, user };
    }

    return { success: false, error: syncResult.error || "Failed to establish session." };
  } catch (error: any) {
    console.error("[AUTH] Verify OTP Error:", error);
    return { success: false, error: error.message || "Verification failed." };
  }
}

export async function syncUser(data: UserSyncData) {
  try {
    await connectToDatabase();
    const email = data.email.toLowerCase();
    const { name, requestedRole } = data;
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    
    // 1. Check if Superadmin
    const isSuperAdminMatch = superadminEmail?.split(',').map(e => e.trim().toLowerCase()).includes(email);
    
    // 2. Check if Restaurant Owner (Admin)
    const restaurant = await RestaurantModel.findOne({ email });
    
    // 3. Find existing user
    let user = await UserModel.findOne({ email });

    // Role Precedence: superadmin > admin > waiter > customer
    const rolePrecedence: Record<string, number> = {
      'superadmin': 4,
      'admin': 3,
      'waiter': 2,
      'customer': 1
    };

    // Determine the "True" maximum role this user is entitled to
    let maxRole: AuthUser['role'] = 'customer';
    if (isSuperAdminMatch) maxRole = 'superadmin';
    else if (restaurant) maxRole = 'admin';
    else if (user) maxRole = user.role;

    // Determine the role to return for THIS session
    // If a specific role was requested and the user is authorized for at least that level, use it.
    // Otherwise fallback to maxRole.
    let sessionRole: AuthUser['role'] = maxRole;
    if (requestedRole && rolePrecedence[maxRole] >= rolePrecedence[requestedRole]) {
      sessionRole = requestedRole as AuthUser['role'];
    }

    // Update or create user in DB, but PROTECT higher roles
    if (isSuperAdminMatch) {
      if (user) {
        // Only update if current role is lower or equal (should stay superadmin)
        user.role = 'superadmin';
        if (name) user.name = name;
        await user.save();
      } else {
        user = await UserModel.create({ email, name: name || "SuperAdmin", role: 'superadmin' });
      }
    } else if (restaurant) {
      if (user) {
        // PROTECT SUPERADMIN: do not demote to admin if they are already superadmin
        if (user.role !== 'superadmin') {
          user.role = 'admin';
        }
        user.restaurantId = restaurant._id;
        if (name) user.name = name;
        await user.save();
      } else {
        user = await UserModel.create({
          email,
          name: name || restaurant.ownerName,
          role: 'admin',
          restaurantId: restaurant._id
        });
      }
    } else if (user) {
      // User exists (waiter/customer).
      if (name) {
        user.name = name;
        await user.save();
      }
    } else {
      // Not in whitelist and doesn't exist
      return { success: false, error: "Access Denied: Your email is not registered." };
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: sessionRole, // Return the role appropriate for THIS session
        restaurantId: user.restaurantId?.toString(),
        restaurantName: restaurant?.name || (user.restaurantId ? (await RestaurantModel.findById(user.restaurantId))?.name : undefined)
      }
    };

  } catch (error: any) {
    console.error("[AUTH] Sync User Critical Error:", error.message);
    throw error;
  }
}

export async function getSession(role?: string): Promise<AuthUser | null> {
  const allCookieNames = ["menu_qr_admin_session", "menu_qr_superadmin_session", "menu_qr_waiter_session", "menu_qr_customer_session"];
  
  // Create a search list: if role is provided, put its cookie first
  let searchList = [...allCookieNames];
  if (role) {
    const roleCookiePath = `menu_qr_${role}_session`;
    searchList = [roleCookiePath, ...allCookieNames.filter(name => name !== roleCookiePath)];
  }

  try {
    const cookieStore = await cookies();
    
    for (const name of searchList) {
      const sessionCookie = cookieStore.get(name);
      if (sessionCookie) {
        try {
          if (!sessionCookie.value || sessionCookie.value.trim() === '') {
            continue;
          }
          return JSON.parse(sessionCookie.value) as AuthUser;
        } catch (e) {
          console.error(`[AUTH] Failed to parse session cookie ${name}:`, e);
          continue;
        }
      }
    }
  } catch (error) {
    console.error("[AUTH] getSession error:", error);
  }

  return null;
}

export async function logout(role?: string) {
  const cookieStore = await cookies();
  if (role) {
    cookieStore.delete(`menu_qr_${role}_session`);
  } else {
    ["admin", "superadmin", "waiter", "customer"].forEach(r => {
      cookieStore.delete(`menu_qr_${r}_session`);
    });
  }
  return { success: true };
}

export async function getUserRole(email: string) {
  await connectToDatabase();
  const user = await UserModel.findOne({ email });
  return user ? user.role : 'customer';
}
