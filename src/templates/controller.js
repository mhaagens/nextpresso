const controllerTemplate = name => `import { Router } from "express";
import { RouteError } from "helpers/route_helpers";

class ${name}Controller {
  constructor() {
    this.router = new Router();
  }

  index = async (req, res) => {
    try {
        res.send({
          hello: "${name}"
        });
    } catch (err) {
        RouteError(res, "Something broke!")
    }
  };

  routes = () => {
    this.router.get("/", this.index);
    return this.router;
  };
}

export default new ${name}Controller();
`;

export default controllerTemplate;