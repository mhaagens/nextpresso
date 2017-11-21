import * as program from "commander";
import { generateProject, generateController } from "./services";

program.version("0.0.1");

// Initialize a project
program
  .command("init [project_name]")
  .description("Create a new project.")
  .action(generateProject);

// Create a controller
program
  .command("controller [controller_name]")
  .description("Create a new controller.")
  .action(generateController);

program.parse(process.argv);
