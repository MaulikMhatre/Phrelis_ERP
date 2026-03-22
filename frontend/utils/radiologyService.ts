// utils/radiologyService.ts
export const analyzeXray = async (file: File, patientId: string) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`http://localhost:8000/api/radiology/scan/${patientId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("AI Analysis Failed");
  return response.json();
};