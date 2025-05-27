# Kwa Ground Vibes Hub

## Project Overview

Kwa Ground Vibes Hub is a community-driven event platform that allows users to submit, discover, and manage local events. Users can create and submit events, which are then reviewed and approved by an admin before being published. The platform features:

- **Event Submission:** Users can submit events with details such as title, description, date, time, location, category, and more.
- **Admin Review:** Submitted events require admin approval before they are visible to the public.
- **User Profiles:** Each event is associated with a user profile, allowing users to track the status of their events.
- **Email Notifications:** The system sends email notifications to admins for new event submissions and to users when their events are approved (using Supabase Edge Functions and the Resend API).
- **Event Discovery:** Approved events are displayed for all users to browse and search.
- **Modern UI:** Built with React, TypeScript, Tailwind CSS for a clean and responsive user experience.

This project is ideal for local communities, organizations, or groups looking to manage and promote events in a collaborative and moderated environment.

*This project was built leveraging Lovable AI for development and code generation assistance.*

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Database, Auth, Edge Functions)
- Resend (Transactional Email API)

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file and add your Supabase and Resend API keys as needed.
4. **Start the development server:**
   ```sh
   npm run dev
   ```
5. **Supabase setup:**
   - Make sure your Supabase project has the required tables (`events`, `profiles`, `categories`) and Edge Functions deployed.
