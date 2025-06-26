/**
 * Frontend service for communicating with the backend API
 */
export class DiagramService {
  static API_BASE = '/api';

  /**
   * Validate diagram syntax
   */
  static async validateDiagram(code) {
    console.log('🔍 DiagramService.validateDiagram called with:', {
      codeLength: code?.length,
      firstLine: code?.split('\n')[0],
      apiUrl: `${this.API_BASE}/diagram/validate`
    });

    try {
      const requestBody = { code };
      console.log('📤 Sending validation request:', requestBody);

      const response = await fetch(`${this.API_BASE}/diagram/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Validation response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Validation response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Validation result:', result);
      return result;
    } catch (error) {
      console.error('❌ Validation error:', error);
      return {
        valid: false,
        error: `Network error: ${error.message}`,
      };
    }
  }

  /**
   * Render diagram for preview
   */
  static async renderDiagram(code, options = {}) {
    console.log('🎨 DiagramService.renderDiagram called with:', {
      codeLength: code?.length,
      options,
      apiUrl: `${this.API_BASE}/diagram/render`
    });

    try {
      const requestBody = { code, options };
      console.log('📤 Sending render request:', requestBody);

      const response = await fetch(`${this.API_BASE}/diagram/render`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Render response status:', response.status, response.statusText);
      console.log('📥 Render response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Render response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Render result:', {
        success: result.success,
        dataLength: result.data?.length,
        format: result.format,
        contentType: result.contentType,
        dataSample: result.data ? result.data.substring(0, 100) + '...' : null
      });

      return result;
    } catch (error) {
      console.error('❌ Render error:', error);
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
  }

  /**
   * Get example diagram
   */
  static async getExampleDiagram(type = 'flowchart') {
    console.log('📚 DiagramService.getExampleDiagram called with:', {
      type,
      apiUrl: `${this.API_BASE}/diagram/example/${type}`
    });

    try {
      const response = await fetch(`${this.API_BASE}/diagram/example/${type}`);
      console.log('📥 Example response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Example response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Example result:', result);
      return result;
    } catch (error) {
      console.error('❌ Example fetch error:', error);
      return {
        type,
        example: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`
      };
    }
  }

  /**
   * Export diagram
   */
  static async exportDiagram(code, options = {}) {
    console.log('📦 DiagramService.exportDiagram called with:', {
      codeLength: code?.length,
      options,
      apiUrl: `${this.API_BASE}/export/download`
    });

    try {
      const requestBody = { code, options };
      console.log('📤 Sending export request:', requestBody);

      const response = await fetch(`${this.API_BASE}/export/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Export response status:', response.status, response.statusText);
      console.log('📥 Export response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Export response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Export successful');
      return response; // Return response for blob handling
    } catch (error) {
      console.error('❌ Export error:', error);
      throw error;
    }
  }
}

