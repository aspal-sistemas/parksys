// Script temporal para actualizar las rutas de amenidades
const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'routes.ts');
let routesContent = fs.readFileSync(routesPath, 'utf8');

// Actualizar la ruta POST /amenities
const createAmenityMatch = routesContent.match(/apiRouter\.post\("\/amenities".*?const data = \{[\s\S]*?\};/);
if (createAmenityMatch) {
  const oldDataBlock = createAmenityMatch[0].match(/const data = \{[\s\S]*?\};/)[0];
  const newDataBlock = `const data = {
        name: req.body.name,
        icon: req.body.icon,
        category: req.body.category,
        iconType: req.body.iconType || 'system',
        customIconUrl: req.body.customIconUrl || null
      };`;
  
  routesContent = routesContent.replace(oldDataBlock, newDataBlock);
}

// Actualizar la ruta PUT /amenities/:id
const updateAmenityMatch = routesContent.match(/apiRouter\.put\("\/amenities\/\:id".*?const data = \{[\s\S]*?\};/);
if (updateAmenityMatch) {
  const oldDataBlock = updateAmenityMatch[0].match(/const data = \{[\s\S]*?\};/)[0];
  const newDataBlock = `const data = {
        name: req.body.name,
        icon: req.body.icon,
        category: req.body.category,
        iconType: req.body.iconType || 'system',
        customIconUrl: req.body.customIconUrl || null
      };`;
  
  routesContent = routesContent.replace(oldDataBlock, newDataBlock);
}

fs.writeFileSync(routesPath, routesContent, 'utf8');
console.log('Rutas actualizadas correctamente');
