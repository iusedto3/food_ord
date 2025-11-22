export const ok = (res, data, message = "") =>
  res.json({ success: true, message, data });

export const created = (res, data, message = "") =>
  res.status(201).json({ success: true, message, data });

export const badRequest = (res, message) =>
  res.status(400).json({ success: false, message });

export const notFound = (res, message) =>
  res.status(404).json({ success: false, message });

export const serverError = (res, error) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Server error" });
};
