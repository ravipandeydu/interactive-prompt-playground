document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const promptForm = document.getElementById('promptForm');
  const systemPrompt = document.getElementById('systemPrompt');
  const userPrompt = document.getElementById('userPrompt');
  const modelSelect = document.getElementById('modelSelect');
  const stopSequence = document.getElementById('stopSequence');
  const runButton = document.getElementById('runButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultsContainer = document.getElementById('resultsContainer');
  const exportButton = document.getElementById('exportButton');
  const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
  const errorModalBody = document.getElementById('errorModalBody');

  // Default system prompt
  systemPrompt.value = 'You are a helpful, creative, and concise assistant.';

  // Form submission handler
  promptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!systemPrompt.value.trim()) {
      showError('System prompt is required');
      return;
    }
    
    if (!userPrompt.value.trim()) {
      showError('User prompt is required');
      return;
    }
    
    // Get selected parameter values
    const temperatureValues = getSelectedValues('temperature');
    const maxTokensValues = getSelectedValues('max_tokens');
    const presencePenaltyValues = getSelectedValues('presence_penalty');
    const frequencyPenaltyValues = getSelectedValues('frequency_penalty');
    const stopValue = stopSequence.value.trim();
    
    // Validate at least one value is selected for each parameter
    if (!temperatureValues.length) {
      showError('Please select at least one Temperature value');
      return;
    }
    
    if (!maxTokensValues.length) {
      showError('Please select at least one Max Tokens value');
      return;
    }
    
    if (!presencePenaltyValues.length) {
      showError('Please select at least one Presence Penalty value');
      return;
    }
    
    if (!frequencyPenaltyValues.length) {
      showError('Please select at least one Frequency Penalty value');
      return;
    }
    
    // Generate all parameter combinations
    const parameterSets = generateParameterCombinations(
      temperatureValues,
      maxTokensValues,
      presencePenaltyValues,
      frequencyPenaltyValues,
      stopValue
    );
    
    // Show loading state
    setLoadingState(true);
    
    try {
      // Send request to the server
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt.value,
          userPrompt: userPrompt.value,
          model: modelSelect.value,
          parameterSets
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate responses');
      }
      
      const data = await response.json();
      
      // Display results
      displayResults(data.results);
      
      // Enable export button
      exportButton.disabled = false;
    } catch (error) {
      showError(error.message || 'An error occurred while generating responses');
      // Clear results container
      resultsContainer.innerHTML = `
        <div class="text-center py-5 text-muted">
          <p>An error occurred. Please try again.</p>
        </div>
      `;
    } finally {
      // Hide loading state
      setLoadingState(false);
    }
  });
  
  // Export button handler
  exportButton.addEventListener('click', () => {
    const resultsData = {
      systemPrompt: systemPrompt.value,
      userPrompt: userPrompt.value,
      model: modelSelect.value,
      timestamp: new Date().toISOString(),
      results: window.lastResults || []
    };
    
    const blob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-playground-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  // Helper function to get selected checkbox values
  function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => parseFloat(cb.value));
  }
  
  // Helper function to generate all parameter combinations
  function generateParameterCombinations(temperatures, maxTokens, presencePenalties, frequencyPenalties, stop) {
    const combinations = [];
    
    for (const temperature of temperatures) {
      for (const max_tokens of maxTokens) {
        for (const presence_penalty of presencePenalties) {
          for (const frequency_penalty of frequencyPenalties) {
            combinations.push({
              temperature,
              max_tokens: parseInt(max_tokens),
              presence_penalty,
              frequency_penalty,
              stop: stop || undefined
            });
          }
        }
      }
    }
    
    return combinations;
  }
  
  // Helper function to display results
  function displayResults(results) {
    // Store results for export
    window.lastResults = results;
    
    // Create results grid
    resultsContainer.innerHTML = '<div class="results-grid" id="resultsGrid"></div>';
    const resultsGrid = document.getElementById('resultsGrid');
    
    // Add each result to the grid
    results.forEach((result, index) => {
      const { parameters, response, error, usage } = result;
      
      // Create result card
      const resultCard = document.createElement('div');
      resultCard.className = 'result-card';
      
      // Create header with parameters
      const header = document.createElement('div');
      header.className = 'result-header';
      header.innerHTML = `
        <div>
          <span class="param-badge param-temp">Temp: ${parameters.temperature}</span>
          <span class="param-badge param-tokens">Max: ${parameters.max_tokens}</span>
          <span class="param-badge param-presence">Presence: ${parameters.presence_penalty}</span>
          <span class="param-badge param-frequency">Frequency: ${parameters.frequency_penalty}</span>
        </div>
        ${parameters.stop ? `<div class="mt-1">Stop: "${parameters.stop}"</div>` : ''}
      `;
      
      // Create content area
      const content = document.createElement('div');
      content.className = 'result-content';
      
      if (error) {
        content.innerHTML = `<div class="error-message">${error}</div>`;
      } else {
        content.textContent = response;
      }
      
      // Create footer with token usage if available
      const footer = document.createElement('div');
      footer.className = 'result-footer';
      
      if (usage) {
        footer.innerHTML = `
          <div class="token-usage">
            <span>Prompt: ${usage.prompt_tokens}</span>
            <span>Completion: ${usage.completion_tokens}</span>
            <span>Total: ${usage.total_tokens}</span>
          </div>
        `;
      }
      
      // Assemble card
      resultCard.appendChild(header);
      resultCard.appendChild(content);
      resultCard.appendChild(footer);
      
      // Add to grid
      resultsGrid.appendChild(resultCard);
    });
  }
  
  // Helper function to show error modal
  function showError(message) {
    errorModalBody.textContent = message;
    errorModal.show();
  }
  
  // Helper function to set loading state
  function setLoadingState(isLoading) {
    if (isLoading) {
      runButton.disabled = true;
      loadingSpinner.classList.remove('d-none');
      runButton.textContent = ' Running...';
      runButton.prepend(loadingSpinner);
    } else {
      runButton.disabled = false;
      loadingSpinner.classList.add('d-none');
      runButton.textContent = 'Run Grid';
    }
  }
});