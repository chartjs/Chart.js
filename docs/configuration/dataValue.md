# DataValue

Prints the value of the point on the graph

## Usage
To enable printing of the data values, add `drawValue = true` to the dataset. 

## Configuration
The datavalue configuration is passed into the `options.valueLabel` namespace. The global options for this is defined in `Chart.defaults.global.valueLabel`.

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `fontWeight` | `String` | `normal` | fontWeight of the text
| `fontColor` | `String` | `'#000'` | Color of the text
| `fontSize` | `Number` | `10` | Font size
| `fontStyle` | `String` | `'bold'` | Font style
| `padding` | ` 0` | `0` | Number of pixels to add above and below the title text. [more ..](#padding)
| `value` | `function( chart, value)` | `''` | To customize the value to be printed 

### padding
` { top:0, left:0}`

## Example Usage

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: {
    datasets:[{drawValue:true, data:[1,2,3,4]}]
    },
    options: {
        valueLabel: {
            value:function(chart,value){
                return  value + '$'; 
            },
            fontColor:'#0F0'
        }
    }
})
```
