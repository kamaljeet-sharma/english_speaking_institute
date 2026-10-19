// Generic CRUD handlers used by the admin routes.
const FILTERABLE = ['course', 'batch', 'status', 'level'];

export function crud(Model, { populate = [], sort = '-createdAt' } = {}) {
  return {
    list: async (req, res) => {
      const filter = {};
      for (const key of FILTERABLE) if (req.query[key]) filter[key] = req.query[key];
      res.json(await Model.find(filter).populate(populate).sort(sort));
    },
    get: async (req, res) => {
      const doc = await Model.findById(req.params.id).populate(populate);
      if (!doc) return res.status(404).json({ message: 'Not found.' });
      res.json(doc);
    },
    create: async (req, res) => {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    },
    update: async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ message: 'Not found.' });
      res.json(doc);
    },
    remove: async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found.' });
      res.json({ message: 'Deleted.' });
    },
  };
}
