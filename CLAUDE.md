# Code
Always generate secure code
Minimalism and easy to read code is required
Make sure to not expose any api keys in the front end.
Don't write code that can leak secrets, either in the repo or in the front-end on the browser / client side.

# Design
Use shadcn and mapcn for styling
We need to maintain both a dark mode and light mode
Dark mode is default
Styling should be inspired by 1980s Alien movies such as MUTHUR terminal interfaces with the black and green theme

# Example output of GEOCACHE API
{"input":{"raw":"Riyadh,Riyadh Region, Saudi Arabia"},"normalizedKey":"SA|riyadh region|riyadh|","canonical":{"countryIso2":"SA","countryName":"Saudi Arabia","displayName":"Riyadh, Riyadh Region, Saudi Arabia","admin1":"Riyadh Region","city":"Riyadh"},"granularity":"city","confidence":0.9860357325410992,"flags":{},"provider":"geonames","cache":{"hit":false},"point":{"lat":24.68773,"lon":46.72185},"bbox":[46.428253821561576,24.42154457526411,47.015445061495065,24.953919964811387]}