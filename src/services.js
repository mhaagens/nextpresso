import { copy, writeFile, readJson, readFile, mkdirp } from 'fs-extra';
import { promisify, inspect } from 'util';
import { resolve } from 'path';
import chalk from 'chalk';
import ora from "ora";
import { prompt } from 'inquirer';
import { exec } from 'child_process';
import { delay, capitalize } from './utils';
import { parseModuleWithLocation } from 'shift-parser';
import codegen from 'shift-codegen';
import { traverse } from 'shift-traverse';
import prettier from 'prettier';

import controllerTemplate from './templates/controller.js';

const libDir = resolve(__dirname, '../src/templates');
const log = console.log;
const execAsync = promisify(exec);

const generateProject = async (project_name = '', options) => {
	if (!project_name.length) {
		({ project_name } = await prompt([
			{
				type: 'input',
				name: 'project_name',
				message: 'Project name:'
			}
		]));
	}

	// Progress bars
	const spinner = ora("Copying webpack configuration").start();

	// Actions
	await copy(`${libDir}/webpack.config.js`, `./${project_name}/webpack.config.babel.js`);
	await copy(`${libDir}/webpack.config.dist.js`, `./${project_name}/webpack.config.dist.babel.js`);
	await delay(250);

	spinner.text = "Copying babel configuration";
	await copy(`${libDir}/babelrc.json`, `./${project_name}/.babelrc`);
	await delay(250);

	spinner.text = "Copying .env files";
	await copy(`${libDir}/.env`, `./${project_name}/.env`);
	await copy(`${libDir}/.env.example`, `./${project_name}/.env.example`);
	await delay(250);

	spinner.text = "Copying Hot Module Replacement configuration";
	await copy(`${libDir}/index.js`, `./${project_name}/src/index.js`);
	await delay(250);

	spinner.text = "Copying server file";
	await copy(`${libDir}/server.js`, `./${project_name}/src/server.js`);
	await delay(250);

	spinner.text = "Creating example route-controller";
	await mkdirp(`./${project_name}/src/controllers`);
	await writeFile(
		`./${project_name}/src/controllers/home_controller.js`,
		controllerTemplate("Home")
	);
	await delay(250);

	spinner.text = "Creating route helpers";
	await mkdirp(`./${project_name}/src/helpers`);
	await copy(
		`${libDir}/route_helpers.js`,
		`./${project_name}/src/helpers/route_helpers.js`
	);
	await delay(250);

	spinner.text = "Installing dependencies";
	await execAsync(
		`cd ./${
			project_name
		} && yarn init -y && yarn add express && yarn add webpack clean-webpack-plugin webpack-node-externals start-server-webpack-plugin dotenv-webpack babel-loader babel-preset-env babel-core babel-preset-stage-2 --dev`
	);

	spinner.text = "Adding scripts to package.json";
	const pkg = await readJson(`./${project_name}/package.json`);
	pkg.scripts = { "start": "webpack --config webpack.config.babel.js", "build": "webpack --config webpack.config.dist.babel.js" };
	await writeFile(`./${project_name}/package.json`, JSON.stringify(pkg, null, 2));

	// Done
	spinner.text = "Project generated.";
	spinner.succeed();
	log(`CD into /${project_name}, run yarn start and go to http://localhost:3000 to get started!`);
};

const generateController = async (controller_name, options) => {
	try {
			// Create controller file
	await mkdirp(`./src/controllers`);
	await writeFile(
		`./src/controllers/${controller_name}_controller.js`,
		controllerTemplate(capitalize(controller_name))
	);

	// Generate server AST
	const server = await readFile(`./src/server.js`);
	const { tree, locations, comments } = parseModuleWithLocation(server.toString('utf-8'));

	// Parse server AST
	let exists = false;
	let lastCtrlIdx = null;
	let lastRouteIdx = null;

	tree.items.forEach((item, i) => {
		if (item.type === 'Import' && item.defaultBinding && item.defaultBinding.name.includes('Controller')) {
			lastCtrlIdx = i;
		}
		if (
			item.type === 'ExpressionStatement' &&
			item.expression.arguments &&
			item.expression.arguments.filter(arg => arg.callee && arg.callee.property === 'routes').length
		) {
			lastRouteIdx = i;
		}
		if (
			item.type === 'ExpressionStatement' &&
			item.expression.arguments &&
			item.expression.arguments.filter(arg => arg.callee && arg.callee.object && arg.callee.object.name === `${capitalize(controller_name)}Controller`).length
		) {
			exists = true;
		}
	});

	if (exists) {
		console.log(chalk.red`Controller already exists`);
		return;
	}

	tree.items.splice(lastCtrlIdx + 1, 0, {
		type: 'Import',
		defaultBinding: { type: 'BindingIdentifier', name: `${capitalize(controller_name)}Controller` },
		namedImports: [],
		moduleSpecifier: `controllers/${controller_name}_controller`
	});

	tree.items.splice(lastRouteIdx + 2, 0, {
		type: 'ExpressionStatement',
		expression: {
			type: 'CallExpression',
			callee: {
				type: 'StaticMemberExpression',
				object: { type: 'IdentifierExpression', name: 'server' },
				property: 'use'
			},
			arguments: [
				{ type: 'LiteralStringExpression', value: `/${controller_name}` },
				{
					type: 'CallExpression',
					callee: {
						type: 'StaticMemberExpression',
						object: { type: 'IdentifierExpression', name: `${capitalize(controller_name)}Controller` },
						property: 'routes'
					},
					arguments: []
				}
			]
		}
	});

	await writeFile(`./src/server.js`, prettier.format(codegen(tree)));

	log(`${capitalize(controller_name)}Controller created.`);
	} catch (err) {
		if (err.description && err.description.includes("Duplicate binding")) {
			console.log(chalk.red`Controller already exists`);
		}
	}
};

export { generateProject, generateController };
