import { connectDB } from "@/lib/mongodb";
import CertificationModel from "@/models/Certification";
import CertificationsView from "./CertificationsView";

async function getCertifications() {
  await connectDB();
  const certifications = await CertificationModel.find().sort({ order: 1 }).lean();
  // Ensure we're passing clean serializable data
  return JSON.parse(JSON.stringify(certifications));
}

export default async function Certifications() {
  const certifications = await getCertifications();
  if (!certifications || certifications.length === 0) return null;
  return <CertificationsView certifications={certifications} />;
}
