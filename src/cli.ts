#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { promptBoundedContext, createDirectoryStructure } from "./scripts/contents";

const program = new Command();

program
  .name("ddd-gen")
  .description("Generate DDD structure for a bounded context")
  .version("1.0.0");

async function main() {
  try {
    const boundedContext = await promptBoundedContext();
    await createDirectoryStructure(boundedContext);
    console.log(chalk.green("✨ DDD structure created successfully!"));
  } catch (error) {
    console.error(chalk.red("Error creating DDD structure:"), error);
    process.exit(1);
  }
}

main();
