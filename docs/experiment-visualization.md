# Experiment Visualization Guide

This guide explains how to use the enhanced experiment visualization features in the Statsig Chrome Extension.

## Overview

The extension now provides rich visualization for Statsig experiments, including:

- **Variant Distribution**: Visual representation of traffic allocation across experiment groups
- **Parameter Values**: Display of parameter values for each variant
- **Current Assignment**: Highlighting of the currently assigned variant
- **Interactive Charts**: Color-coded distribution bars and detailed group information

## Components

### ConfigurationItem

The `ConfigurationItem` component now shows experiment variants directly in the configuration list:

- Displays all experiment groups with their percentages
- Highlights the currently assigned group
- Shows variant names as colored badges

### ExperimentVisualization

A comprehensive visualization component that includes:

- **Distribution Bar Chart**: Visual representation of traffic allocation
- **Group Details**: Detailed information for each variant including parameters
- **Summary Statistics**: Total variants, traffic allocation, and active groups

### ExperimentSummaryCard

A compact summary card for quick experiment overview:

- Current group assignment
- Traffic allocation percentage
- Quick access to detailed view

## Data Structure

Experiments now include a `groups` property with the following structure:

```typescript
groups?: Array<{
  name: string
  size: number
  parameterValues?: Record<string, unknown>
}>
```

### Example

```typescript
{
  name: "button_color_test",
  type: "experiment",
  groups: [
    {
      name: "control",
      size: 33,
      parameterValues: { button_color: "blue" }
    },
    {
      name: "variant_a",
      size: 33,
      parameterValues: { button_color: "green" }
    },
    {
      name: "variant_b",
      size: 34,
      parameterValues: { button_color: "red" }
    }
  ]
}
```

## Features

### Visual Indicators

- **Color Coding**: Each variant has a unique color for easy identification
- **Current Group Highlighting**: The assigned variant is highlighted with a purple theme
- **Progress Bars**: Visual representation of traffic distribution
- **Status Badges**: Clear indicators for active/current groups

### Parameter Display

- **Formatted Values**: Parameter values are displayed in a readable format
- **JSON Support**: Complex parameter objects are properly formatted
- **Type Safety**: All parameter values are handled with proper type checking

### Responsive Design

- **Compact Mode**: Optimized layout for smaller spaces
- **Flexible Layout**: Adapts to different screen sizes and container widths
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Usage Examples

### Basic Experiment Display

```tsx
import { ExperimentVisualization } from './ExperimentVisualization'
;<ExperimentVisualization configuration={experimentConfig} evaluationResult={result} compact={false} />
```

### Compact Summary

```tsx
import { ExperimentSummaryCard } from './ExperimentSummaryCard'
;<ExperimentSummaryCard configuration={experimentConfig} evaluationResult={result} />
```

### Integration with Configuration List

The `ConfigurationItem` component automatically detects experiments and displays variant information when available.

## Best Practices

1. **Data Validation**: Always check if `groups` array exists before rendering
2. **Performance**: Use React.memo for components that render many experiments
3. **Accessibility**: Ensure color coding is supplemented with text labels
4. **Error Handling**: Gracefully handle missing or malformed experiment data

## API Integration

The experiment data is automatically fetched from the Statsig Console API and mapped to include group information. The `getExperiments` function in `statsig-api.ts` handles this mapping.

## Troubleshooting

### Common Issues

1. **Missing Groups**: Ensure the Console API response includes group data
2. **Incorrect Percentages**: Verify that group sizes add up to the expected total
3. **Parameter Display**: Check that parameter values are serializable

### Debug Tips

- Use browser dev tools to inspect the experiment configuration object
- Check the Console API response format
- Verify that the evaluation result includes the correct group name
