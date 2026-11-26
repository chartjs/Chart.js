// Checks the TypeScript modules in src/ with the five compiler flags that
// tsconfig.json leaves commented out until the conversion to TypeScript ends.
//
// The program is the one tsconfig.json describes, allowJs included, so the
// JavaScript modules keep their JSDoc types. The flags would also report on
// the JavaScript modules, which are not converted yet, so only diagnostics in
// src/**/*.ts fail the check. Once no JavaScript is left in src/, the flags
// move into tsconfig.json.
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const FLAGS = {
  noFallthroughCasesInSwitch: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noUnusedLocals: true,
  noUnusedParameters: true
};

const root = process.cwd();
const src = path.join(root, 'src') + path.sep;

const host = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => root,
  getNewLine: () => ts.sys.newLine
};

function fail(diagnostics) {
  process.stderr.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
  process.exitCode = 1;
}

const configPath = path.join(root, 'tsconfig.json');
const {config, error} = ts.readConfigFile(configPath, ts.sys.readFile);
if (error) {
  fail([error]);
} else {
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root, FLAGS, configPath);
  if (parsed.errors.length) {
    fail(parsed.errors);
  } else {
    const program = ts.createProgram({
      rootNames: parsed.fileNames,
      options: {...parsed.options, noEmit: true},
      projectReferences: parsed.projectReferences
    });
    const isChecked = (file) => {
      const fileName = path.resolve(file.fileName);
      return fileName.startsWith(src) && fileName.endsWith('.ts');
    };
    const diagnostics = [
      ...program.getOptionsDiagnostics(),
      ...program.getGlobalDiagnostics(),
      ...ts.getPreEmitDiagnostics(program).filter((d) => d.file && isChecked(d.file))
    ];
    if (diagnostics.length) {
      fail(diagnostics);
      process.stderr.write(`\n${diagnostics.length} diagnostic(s) in src/**/*.ts with the transition flags.\n`);
    }
  }
}
