import { z } from "zod";

/* ────────────────────────────────────────────────────────────
   1. Participant Registration
   Fields: Name, Email, Contact, University (apex / other),
           CollegeName (if other), Gender, Blood Group,
           Address, Password, confirmPassword
   ──────────────────────────────────────────────────────────── */
export const registerSchema = z
  .object({
    name:            z.string().min(2, "Name must be at least 2 characters"),
    email:           z.string().email("Invalid email"),
    phone:           z.string().min(10, "Contact must be at least 10 digits"),
    university:      z.enum(["apex_university", "other"], {
      message: "Select a university option",
    }),
    collegeName:     z.string().optional(),    // required only when university = "other"
    gender:          z.enum(["male", "female", "other"], {
      message: "Gender is required",
    }),
    bloodGroup:      z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      message: "Blood group is required",
    }),
    address:         z.string().min(5, "Address must be at least 5 characters"),
    password:        z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    role:            z.enum(["participant"]).default("participant"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.university !== "other" || (d.collegeName && d.collegeName.length >= 2), {
    message: "College name is required when university is 'Other'",
    path: ["collegeName"],
  });

/* ────────────────────────────────────────────────────────────
   2. Volunteer Signup
   Fields: Secret Code (validated in controller), Name, Email,
           Contact, Gender, Blood Group, Password, confirmPassword
   Volunteer is from Apex University by default.
   ──────────────────────────────────────────────────────────── */
export const volunteerSignupSchema = z
  .object({
    secretCode:      z.string().min(1, "Secret code is required"),
    name:            z.string().min(2, "Name must be at least 2 characters"),
    email:           z.string().email("Invalid email"),
    phone:           z.string().min(10, "Contact must be at least 10 digits"),
    gender:          z.enum(["male", "female", "other"], {
      message: "Gender is required",
    }),
    bloodGroup:      z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      message: "Blood group is required",
    }),
    password:        z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ────────────────────────────────────────────────────────────
   4. Login (shared by all roles)
   ──────────────────────────────────────────────────────────── */
export const loginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  email:     z.string().email("Invalid email"),
  password:  z.string().min(1, "Password is required"),
  secretCode: z.string().min(1, "Secret code is required"),
});

/* ────────────────────────────────────────────────────────────
   5. Update profile
   ──────────────────────────────────────────────────────────── */
export const updateProfileSchema = z.object({
  name:       z.string().min(2).optional(),
  phone:      z.string().min(10).optional(),
  gender:     z.enum(["male", "female", "other"]).optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  address:    z.string().min(5).optional(),
  university:  z.enum(["apex_university", "other"]).optional(),
  collegeName: z.string().optional(),
});

/* ────────────────────────────────────────────────────────────
   6. Artist
   Fields: name, description, photo (URL)
   ──────────────────────────────────────────────────────────── */
export const artistSchema = z.object({
  name:        z.string().min(2, "Artist name is required"),
  description: z.string().min(5, "Description is required"),
  photo:       z.string().url("Photo must be a valid URL"),
});

/* ────────────────────────────────────────────────────────────
   7. Event
   Fields: Title, Category, Cost, Venue, Solo/Team, Date,
           Image (optional), Student Coordinators, Faculty
           Coordinators, Rules (optional), Prizes (optional)
   ──────────────────────────────────────────────────────────── */
const coordinatorSchema = z.object({
  name:  z.string().min(1, "Coordinator name is required"),
  phone: z.string().min(10, "Coordinator number is required"),
});

export const eventSchema = z.object({
  title:                z.string().min(2, "Title is required"),
  category:             z.enum(["cultural", "literary", "trending_event", "technical"], {
    message: "Category is required",
  }),
  cost:                 z.coerce.number().min(0).default(0),
  venue:                z.string().min(2, "Venue is required"),
  participationType:    z.enum(["solo", "team"], {
    message: "Select Solo or Team",
  }),
  minTeamSize:          z.coerce.number().min(1).default(2),
  maxTeamSize:          z.coerce.number().min(1).default(5),
  date:                 z.string(),                              // ISO date string
  image:                z.string().optional(),                   // link (optional)
  studentCoordinators:  z.array(coordinatorSchema).optional().default([]),
  facultyCoordinators:  z.array(coordinatorSchema).optional().default([]),
  rules:                z.string().optional(),
  prizes:               z.string().optional(),
});

/* ────────────────────────────────────────────────────────────
   8. QR verify body
   ──────────────────────────────────────────────────────────── */
export const qrVerifySchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

/* ────────────────────────────────────────────────────────────
   9. Event Registration
   ──────────────────────────────────────────────────────────── */
export const eventRegistrationSchema = z.object({
  teamName:    z.string().min(1).optional(),
  teamMembers: z.array(z.object({
    name:  z.string().min(1, "Member name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
  })).default([]),
  paymentId:   z.string().optional(),
});
