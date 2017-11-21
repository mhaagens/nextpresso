const NotFound = (req, res) =>
  res.status(404).send({
    message: "Not found"
  });

const RouteError = (res, message) =>
  res.status(500).send({
    status: "error",
    message: message
  });

export { NotFound, RouteError };
