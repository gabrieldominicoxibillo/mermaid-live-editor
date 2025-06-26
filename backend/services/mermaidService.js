const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const FileUtils = require('../utils/fileUtils');
const config = require('../config/config');

/**
 * Mermaid diagram processing service
 * Handles validation, rendering, and diagram operations
 */
class MermaidService {
  constructor() {
    this.tempDir = config.TEMP_DIR;
  }

  /**
   * Validate Mermaid diagram syntax
   * @param {string} mermaidCode - The Mermaid diagram code
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateDiagram(mermaidCode) {
    if (!mermaidCode || !mermaidCode.trim()) {
      return { valid: false, error: 'Empty diagram code' };
    }

    // Basic syntax validation first
    const basicValidation = this.basicSyntaxCheck(mermaidCode);
    if (!basicValidation.valid) {
      return basicValidation;
    }

    // Try to render a small version to validate syntax
    const inputFile = path.join(this.tempDir, FileUtils.generateUniqueFilename('mmd'));
    const outputFile = path.join(this.tempDir, FileUtils.generateUniqueFilename('svg'));

    try {
      await fs.writeFile(inputFile, mermaidCode);

      return new Promise((resolve) => {
        const command = `npx mmdc -i "${inputFile}" -o "${outputFile}" -w 200 -H 200`;

        exec(command, { timeout: 15000 }, async (error, stdout, stderr) => {
          // Always cleanup temp files
          await Promise.all([
            FileUtils.safeDelete(inputFile),
            FileUtils.safeDelete(outputFile)
          ]);

          if (error) {
            const errorMessage = this.parseErrorMessage(stderr || error.message);
            resolve({ valid: false, error: errorMessage });
          } else {
            resolve({ valid: true });
          }
        });
      });
    } catch (error) {
      await Promise.all([
        FileUtils.safeDelete(inputFile),
        FileUtils.safeDelete(outputFile)
      ]);
      return { valid: false, error: `File operation failed: ${error.message}` };
    }
  }

  /**
   * Basic syntax check before full validation
   * @private
   */
  basicSyntaxCheck(mermaidCode) {
    const code = mermaidCode.trim();

    // Check for valid diagram types
    const validTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'gantt', 'pie', 'journey', 'gitgraph',
      'requirement', 'mindmap', 'timeline', 'erDiagram'
    ];

    const firstLine = code.split('\n')[0].trim().toLowerCase();
    const hasValidType = validTypes.some(type => firstLine.startsWith(type.toLowerCase()));

    if (!hasValidType) {
      return {
        valid: false,
        error: 'Invalid diagram type. Must start with: ' + validTypes.join(', ')
      };
    }

    // Check for minimum content
    if (code.split('\n').filter(line => line.trim()).length < 2) {
      return {
        valid: false,
        error: 'Diagram must have at least one element or connection'
      };
    }

    return { valid: true };
  }

  /**
   * Render Mermaid diagram to specified format
   * @param {string} mermaidCode - The Mermaid diagram code
   * @param {Object} options - Rendering options
   * @returns {Promise<{success: boolean, data?: string, format: string, contentType: string}>}
   */
  async renderDiagram(mermaidCode, options = {}) {
    const {
      format = 'svg',
      theme = config.DEFAULT_THEME,
      width = config.DEFAULT_WIDTH,
      height = config.DEFAULT_HEIGHT,
      scale = config.DEFAULT_SCALE
    } = options;

    // Validate format
    if (!config.SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Validate theme
    if (!config.SUPPORTED_THEMES.includes(theme)) {
      throw new Error(`Unsupported theme: ${theme}`);
    }

    const inputFile = path.join(this.tempDir, FileUtils.generateUniqueFilename('mmd'));
    const outputFile = path.join(this.tempDir, FileUtils.generateUniqueFilename(format));

    try {
      await fs.writeFile(inputFile, mermaidCode);

      const command = this.buildRenderCommand(inputFile, outputFile, {
        format, theme, width, height, scale
      });

      return new Promise((resolve, reject) => {
        exec(command, { timeout: 30000 }, async (error, stdout, stderr) => {
          try {
            if (error) {
              const errorMessage = this.parseErrorMessage(stderr || error.message);
              reject(new Error(`Render failed: ${errorMessage}`));
              return;
            }

            // Read the generated file
            const outputData = await fs.readFile(outputFile);

            resolve({
              success: true,
              data: outputData.toString('base64'),
              format,
              contentType: config.CONTENT_TYPES[format]
            });
          } catch (readError) {
            reject(new Error(`Failed to read output: ${readError.message}`));
          } finally {
            // Cleanup temp files
            await Promise.all([
              FileUtils.safeDelete(inputFile),
              FileUtils.safeDelete(outputFile)
            ]);
          }
        });
      });
    } catch (error) {
      await Promise.all([
        FileUtils.safeDelete(inputFile),
        FileUtils.safeDelete(outputFile)
      ]);
      throw new Error(`Render preparation failed: ${error.message}`);
    }
  }

  /**
   * Build mermaid-cli command with options
   * @private
   */
  buildRenderCommand(inputFile, outputFile, options) {
    const { format, theme, width, height, scale } = options;

    let command = `npx mmdc -i "${inputFile}" -o "${outputFile}"`;

    if (theme !== 'default') {
      command += ` -t ${theme}`;
    }

    if (width) {
      command += ` -w ${width}`;
    }

    if (height) {
      command += ` -H ${height}`;
    }

    if (scale && scale !== 1) {
      command += ` -s ${scale}`;
    }

    // Add background color for better visibility
    if (format === 'png') {
      command += ' -b white';
    }

    return command;
  }

  /**
   * Parse error messages for better user feedback
   * @private
   */
  parseErrorMessage(errorText) {
    if (!errorText) return 'Unknown error occurred';

    // Common Mermaid error patterns
    const patterns = [
      { regex: /Parse error on line (\d+)/, message: 'Syntax error on line $1' },
      { regex: /Expecting (.+) but/, message: 'Expected $1' },
      { regex: /Unknown diagram type/, message: 'Unknown diagram type. Check the diagram declaration.' },
      { regex: /ENOENT/, message: 'Mermaid CLI not found. Please install @mermaid-js/mermaid-cli' }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(errorText)) {
        return errorText.replace(pattern.regex, pattern.message);
      }
    }

    // Return cleaned error message
    return errorText.split('\n')[0].trim();
  }

  /**
   * Get supported diagram types
   */
  getSupportedDiagramTypes() {
    return [
      'flowchart',
      'graph',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'gantt',
      'pie',
      'journey',
      'gitgraph',
      'requirement',
      'mindmap',
      'timeline'
    ];
  }

  /**
   * Get example diagram for a specific type
   */
  getExampleDiagram(type = 'flowchart') {
    const examples = {
      flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,

      sequence: `sequenceDiagram
    participant User
    participant App
    participant API
    
    User->>App: Request data
    App->>API: Fetch data
    API-->>App: Return data
    App-->>User: Display data`,

      class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +String breed
        +bark()
    }
    
    Animal <|-- Dog`
    };

    return examples[type] || examples.flowchart;
  }
}

module.exports = new MermaidService();
