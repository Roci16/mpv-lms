const { parseString } = require('xml2js');

//Clases
class Manifest {
  constructor() {
    this.organization = null;
  }

  setOrganization(organization) {
    this.organization = organization;
  }

  //Lo convierte a formato JSON
  toJSON() {
    return {
      organization: this.organization ? this.organization.toJSON() : null
    };
  }
}

class Organization {
  constructor(identifier, items) {
    this.identifier = identifier;
    this.items = items;
  }

  //Lo convierte a formato JSON
  toJSON() {
    return {
      identifier: this.identifier,
      items: this.items.map(item => item.toJSON())
    };
  }
}

class Item {
  constructor(identifier, title, resources) {
    this.identifier = identifier;
    this.title = title;
    this.resources = resources;
  }

  //Lo convierte a formato JSON
  toJSON() {
    const item = {
      identifier: this.identifier,
      title: this.title
    };

    if (this.resources && this.resources.length > 0) {
      item.resources = this.resources.map(resource => resource.toJSON());
    }

    return item;
  }
}

class Resource {
  constructor(identifier, href, type, scormtype) {
    this.identifier = identifier;
    this.href = href || "sin valor";
    this.type = type;
    this.scormtype = scormtype;
  }

  //Lo convierte a formato JSON
  toJSON() {
    return {
      identifier: this.identifier,
      href: this.href,
      type: this.type,
      'adlcp:scormtype': this.scormtype,
    };
  }
}


//Factory de Item - crear la instancias de Item
class ItemFactory {
  createItem(identifier, title, resources) {
    return new Item(identifier, title, resources);
  }
}

//Construye el manifiesto a partir de un archivo XML
function buildFromXML(xmlString) {
  //const xmlString = fs.readFileSync(xmlPath, 'utf8');

  let xmlResult;

  parseString(xmlString, (err, result) => {
    if (err) {
      console.error('Error al analizar el archivo XML:', err);
      return;
    }

    const manifest = new Manifest();

    const organizationNodes = result.manifest.organizations?.[0]?.organization || [];
    if (organizationNodes.length > 0) {
      const organizationNode = organizationNodes[0];

      // Crea una instancia de Organization con su identificador
      const organization = new Organization(
        organizationNode.$.identifier,
        []
      );
      manifest.setOrganization(organization);

      const itemNodes = organizationNode.item || [];
      const itemFactory = new ItemFactory();

      // crea instancias de Item
      const items = itemNodes.map(itemNode => {
        const resourceNodes = result.manifest.resources?.[0]?.resource || [];
        const resources = resourceNodes.map(resourceNode => {

          // Crea instancias de Resource para cada recurso
          return new Resource(
            resourceNode.$.identifier,
            resourceNode.$.href,
            resourceNode.$.type,
            resourceNode.$['adlcp:scormtype'],
          );
        });

        // Crea una instancia de Item utilizando el factory
        const item = itemFactory.createItem(
          itemNode.$.identifier,
          itemNode.title?.[0],
          resources.length > 0 ? resources : null
        );
        return item;
      });

      // Asigna los ítems a la organización
      organization.items = items.length > 0 ? items : null;
    }

    // Convierte el manifiesto a formato JSON y lo imprime
    const jsonManifest = manifest.toJSON();

    xmlResult = jsonManifest;
  });

  return xmlResult;
}

module.exports = {
  buildFromXML
};
