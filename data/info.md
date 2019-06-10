## data: files that end in `-gam-instance-data.json`

array of objects, each object is a data point

"y": predicted value (e.g., in dollars)
"id": data point id,
"dr": dimensionality reduction coordinates, can ignore this
"data": array of objects, each object is a feature/attribute/column of a data point
	"name": feature name
	"X": feature value (in units of feature)
	"pdep": f(x) value from GAM, i.e., one bar from the waterfall chart, these are the values that are added cumulatively to get final prediction
	"confi_u_X" and "confi_l_X": confidence values for each point, these can be ignored

so "y" = intercept + sum of "pdep"
i.e. prediction = intercept + sum of GAM outputs for each feature (bars in waterfall chart)

intercept is constant value from model

## intercept values:

### regression: 
`housing`: 16.51863632806001 (dollars, average price of home in a single neighborhood)
`ames-housing`: 180193.3833448762 (dollars, house price)
`diamonds`: 10465.523403663534 (dollars, diamond price)
`red-wine`: 3.597233087564209 (points, higher is better wine quality)
