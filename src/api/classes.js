import api from "./axios";

const USE_MOCK = false;

const CAMPUS_IDS = ["boys", "girls", "kids"];

const MOCK_CLASSES = {
  boys: [
    { id: "b1", campusId: "boys", name: "Class 1", sections: ["A", "B", "C"] },
    { id: "b2", campusId: "boys", name: "Class 2", sections: ["A", "B", "C"] },
    { id: "b3", campusId: "boys", name: "Class 3", sections: ["A", "B"] },
    { id: "b4", campusId: "boys", name: "Class 4", sections: ["A", "B"] },
    { id: "b5", campusId: "boys", name: "Class 5", sections: ["A", "B", "C"] },
    { id: "b6", campusId: "boys", name: "Class 6", sections: ["A", "B"] },
    { id: "b7", campusId: "boys", name: "Class 7", sections: ["A", "B"] },
    { id: "b8", campusId: "boys", name: "Class 8", sections: ["A", "B"] },
    { id: "b9", campusId: "boys", name: "Class 9", sections: ["A", "B"] },
    {
      id: "b10",
      campusId: "boys",
      name: "Class 10",
      sections: ["A", "B", "C"],
    },
  ],
  girls: [
    { id: "g1", campusId: "girls", name: "Class 1", sections: ["A", "B"] },
    { id: "g2", campusId: "girls", name: "Class 2", sections: ["A", "B"] },
    { id: "g3", campusId: "girls", name: "Class 3", sections: ["A", "B"] },
    { id: "g4", campusId: "girls", name: "Class 4", sections: ["A", "B"] },
    { id: "g5", campusId: "girls", name: "Class 5", sections: ["A", "B"] },
    { id: "g6", campusId: "girls", name: "Class 6", sections: ["A", "B"] },
    { id: "g7", campusId: "girls", name: "Class 7", sections: ["A", "B"] },
    { id: "g8", campusId: "girls", name: "Class 8", sections: ["A", "B"] },
    { id: "g9", campusId: "girls", name: "Class 9", sections: ["A", "B"] },
    { id: "g10", campusId: "girls", name: "Class 10", sections: ["A", "B"] },
  ],
  kids: [
    { id: "k1", campusId: "kids", name: "Nursery", sections: ["A", "B"] },
    { id: "k2", campusId: "kids", name: "Prep", sections: ["A", "B"] },
    { id: "k3", campusId: "kids", name: "Class 1", sections: ["A", "B"] },
    { id: "k4", campusId: "kids", name: "Class 2", sections: ["A", "B"] },
    { id: "k5", campusId: "kids", name: "Class 3", sections: ["A", "B"] },
  ],
};

const emptyCampusGroups = () => ({
  boys: [],
  girls: [],
  kids: [],
});

/** Unwrap { success, data } from axios response body */
const unwrap = (response) => {
  const body = response?.data;
  if (body && Object.prototype.hasOwnProperty.call(body, "data")) {
    return body.data;
  }
  return body;
};

const normalizeClass = (doc) => {
  if (!doc) return doc;
  return {
    id: doc.id,
    campusId: doc.campusId,
    name: doc.name,
    sections: Array.isArray(doc.sections) ? doc.sections : [],
    order: doc.order,
    studentCount: doc.studentCount,
  };
};

const normalizeClassList = (list) =>
  (Array.isArray(list) ? list : []).map(normalizeClass);

const groupByCampus = (list) => {
  const grouped = emptyCampusGroups();
  for (const cls of normalizeClassList(list)) {
    if (grouped[cls.campusId]) {
      grouped[cls.campusId].push(cls);
    }
  }
  for (const campusId of CAMPUS_IDS) {
    grouped[campusId].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return grouped;
};

export const classesAPI = {
  // GET /api/classes?campusId=boys
  // Without campusId returns { boys: [], girls: [], kids: [] }
  getAll: async (campusId) => {
    if (USE_MOCK) {
      if (campusId) {
        return { data: MOCK_CLASSES[campusId] || [] };
      }
      return { data: MOCK_CLASSES };
    }

    const response = await api.get("/classes", {
      params: campusId ? { campusId } : undefined,
    });
    const payload = unwrap(response);

    if (campusId) {
      return { data: normalizeClassList(payload) };
    }

    return { data: groupByCampus(payload) };
  },

  // GET /api/classes/:id
  getById: async (id) => {
    if (USE_MOCK) {
      for (const campus of Object.values(MOCK_CLASSES)) {
        const found = campus.find((c) => c.id === id);
        if (found) {
          return { data: found };
        }
      }
      throw new Error("Class not found");
    }

    const response = await api.get(`/classes/${id}`);
    return { data: normalizeClass(unwrap(response)) };
  },

  // POST /api/classes
  create: async (data) => {
    if (USE_MOCK) {
      const newId = `${data.campusId[0]}${Date.now()}`;
      const newClass = {
        id: newId,
        campusId: data.campusId,
        name: data.name,
        sections: data.sections,
      };
      if (!MOCK_CLASSES[data.campusId]) {
        MOCK_CLASSES[data.campusId] = [];
      }
      MOCK_CLASSES[data.campusId].push(newClass);
      return { data: newClass };
    }

    const response = await api.post("/classes", data);
    return { data: normalizeClass(unwrap(response)) };
  },

  // PUT /api/classes/:id
  update: async (id, data) => {
    if (USE_MOCK) {
      for (const campus of Object.values(MOCK_CLASSES)) {
        const index = campus.findIndex((c) => c.id === id);
        if (index !== -1) {
          campus[index] = { ...campus[index], ...data };
          return { data: campus[index] };
        }
      }
      throw new Error("Class not found");
    }

    const response = await api.put(`/classes/${id}`, data);
    return { data: normalizeClass(unwrap(response)) };
  },

  // DELETE /api/classes/:id
  delete: async (id) => {
    if (USE_MOCK) {
      for (const campus of Object.values(MOCK_CLASSES)) {
        const index = campus.findIndex((c) => c.id === id);
        if (index !== -1) {
          campus.splice(index, 1);
          return { data: { success: true } };
        }
      }
      throw new Error("Class not found");
    }

    const response = await api.delete(`/classes/${id}`);
    return { data: unwrap(response) ?? { success: true } };
  },

  // POST /api/classes/:id/sections
  addSection: async (classId, section) => {
    if (USE_MOCK) {
      for (const campus of Object.values(MOCK_CLASSES)) {
        const cls = campus.find((c) => c.id === classId);
        if (cls) {
          if (!cls.sections.includes(section)) {
            cls.sections.push(section);
          }
          return { data: cls };
        }
      }
      throw new Error("Class not found");
    }

    const response = await api.post(`/classes/${classId}/sections`, {
      section,
    });
    return { data: normalizeClass(unwrap(response)) };
  },

  // DELETE /api/classes/:id/sections/:section
  removeSection: async (classId, section) => {
    if (USE_MOCK) {
      for (const campus of Object.values(MOCK_CLASSES)) {
        const cls = campus.find((c) => c.id === classId);
        if (cls) {
          cls.sections = cls.sections.filter((s) => s !== section);
          return { data: cls };
        }
      }
      throw new Error("Class not found");
    }

    const response = await api.delete(
      `/classes/${classId}/sections/${encodeURIComponent(section)}`,
    );
    return { data: normalizeClass(unwrap(response)) };
  },
};
