const { parseString } = require('xml2js');


class Manifest {
  constructor(metadata, organizations, resources) {
    this.metadata = metadata;
    this.organizations = organizations;
    this.resources = resources;
  }

  getMetadata() {
    return this.metadata;
  }

  getOrganizations() {
    return this.organizations;
  }

  getResources() {
    return this.resources;
  }

  static buildFromXML(xml) {
    const metadata = MetadataFactory.buildFromXML(xml);

    const organizations = new Organizations(xml.manifest.organizations?.[0]?.$.default);
    const organizationNodes = xml.manifest.organizations?.[0]?.organization || [];
    for (const organizationNode of organizationNodes) {
      const organization = new Organization(
        organizationNode.$.identifier,
        organizationNode.title?.[0]
      );
      organizations.addOrganization(organization);

      for (const itemNode of organizationNode.item || []) {
        const item = new Item(
          itemNode.$.identifier,
          itemNode.$.isvisible,
          itemNode.$.identifierref,
          itemNode.title?.[0]
        );

        const nestedItemNodes = itemNode.item || [];
        for (const nestedItemNode of nestedItemNodes) {
          const nestedItem = new Item(
            nestedItemNode.$.identifier,
            nestedItemNode.$.isvisible,
            nestedItemNode.$.identifierref,
            nestedItemNode.title?.[0]
          );
          item.addItem(nestedItem);
        }
        organization.addItem(item);
      }
    }

    const resources = new Resources();
    for (const resourceNode of xml.manifest.resources?.[0]?.resource || []) {
      const resource = new Resource(
        resourceNode.$.identifier,
        resourceNode.$.type,
        resourceNode.$.href,
        resourceNode.$['adlcp:scormtype']
      );
      resources.addResource(resource);
    }

    const manifest = new Manifest(metadata, organizations, resources);
    // return manifest;

    const jsonManifest = {
      metadata: manifest.getMetadata(),
      organizations: manifest.getOrganizations(),
      resources: manifest.getResources()
    };

    return JSON.stringify(jsonManifest);
  }
}

class Metadata {
  constructor(schema, schemaversion) {
    this.schema = schema;
    this.schemaversion = schemaversion;
  }
}

class MetadataFactory {
  static buildFromXML(xml) {
    const schema = xml.manifest.metadata?.[0]?.schema?.[0];
    const schemaversion = xml.manifest.metadata?.[0]?.schemaversion?.[0];
    return new Metadata(schema, schemaversion);
  }
}

class Organizations {
  constructor(defaultOrg) {
    this.defaultOrg = defaultOrg;
    this.organization = [];
  }

  addOrganization(organization) {
    this.organization.push(organization);
  }
}

class Organization {
  constructor(identifier, title) {
    this.identifier = identifier;
    this.title = title;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }
}

class Item {
  constructor(identifier, isvisible, identifierref, title) {
    this.identifier = identifier;
    this.isvisible = isvisible;
    this.identifierref = identifierref;
    this.title = title;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }
}

class Resources {
  constructor() {
    this.resource = [];
  }

  addResource(resource) {
    this.resource.push(resource);
  }
}

class Resource {
  constructor(identifier, type, href, scormtype) {
    this.identifier = identifier;
    this.type = type;
    this.href = href || "sin valor";
    this.scormtype = scormtype;
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

     xmlResult = Manifest.buildFromXML(result);
  })

  return xmlResult;
}

module.exports = {
  buildFromXML
};
