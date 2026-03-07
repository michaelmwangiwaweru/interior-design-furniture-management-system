const API = "http://localhost:9193/api/catalog";

export const addItem = (formData) =>
  fetch(API, {
    method: "POST",
    body: formData,
  }).then((res) => res.json());

export const updateItem = (id, formData) =>
  fetch(`${API}/${id}`, {
    method: "PUT",
    body: formData,
  }).then((res) => res.json());

export const getItems = () => fetch(API).then((res) => res.json());

export const deleteItem = (id) =>
  fetch(`${API}/${id}`, { method: "DELETE" });
