export const uploadImage = (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
    }
    const imagePath = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl: imagePath });
};
//# sourceMappingURL=upload.controller.js.map