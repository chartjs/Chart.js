module.exports = {
    config: {
        type: 'radar',
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            datasets: [{
                borderColor: 'red',
                data2: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
                dataKey: 'data2',
                fill: false,
            }]
        },
        options: {
            responsive: false,
            scale: {
                display: false,
                min: 0,
                max: 3
            },
        }
    },
    options: {
        canvas: {
            height: 512,
            width: 512
        }
    }
}
