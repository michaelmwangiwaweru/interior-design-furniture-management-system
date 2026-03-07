import { useState, useEffect } from "react";

export default function CatalogForm({ selected, onSave, onCancel }) {
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fields, setFields] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    if (selected) {
      setFields({
        name: selected.name,
        description: selected.description,
        price: selected.price,
        category: selected.category,
      });

      if (selected.photo) {
        setPreview(`data:image/jpeg;base64,${selected.photo}`);
      }
    }
  }, [selected]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) =>
    setFields({ ...fields, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (photoFile) formData.append("photo", photoFile);

    Object.entries(fields).forEach(([key, value]) =>
      formData.append(key, value)
    );

    onSave(formData);
    setPhotoFile(null);
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 20 }}>

      <input type="file" accept="image/*" onChange={handleFile} /><br />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ width: 150, marginTop: 10 }}
        />
      )}

      <input name="name" placeholder="Name" value={fields.name} onChange={handleChange} />
      <br />

      <textarea name="description" placeholder="Description" value={fields.description} onChange={handleChange}></textarea>
      <br />

      <input type="number" name="price" placeholder="Price" value={fields.price} onChange={handleChange} />
      <br />

      <input name="category" placeholder="Category" value={fields.category} onChange={handleChange} />
      <br />

      <button type="submit">{selected ? "Update" : "Add"} Item</button>
      {selected && <button onClick={onCancel}>Cancel</button>}
    </form>
  );
}
