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

      const processItem = (itemNode, parentItem) => {
        const item = new Item(
          itemNode.$.identifier,
          itemNode.$.isvisible,
          itemNode.$.identifierref,
          itemNode.title?.[0]
        );
        parentItem.addItem(item);

        const nestedItemNodes = itemNode.item || [];
        for (const nestedItemNode of nestedItemNodes) {
          processItem(nestedItemNode, item);
        }
      };

      for (const itemNode of organizationNode.item || []) {
        processItem(itemNode, organization);
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
    const jsonManifest = {
      metadata: manifest.getMetadata(),
      organizations: manifest.getOrganizations(),
      resources: manifest.getResources()
    };

    return jsonManifest;
  }
}

class Metadata {
  constructor(schema, schemaversion) {
    this.schema = schema;
    this.schemaversion = schemaversion;
  }

  toJSON() {
    return {
      schema: this.schema,
      schemaversion: this.schemaversion
    };
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

  toJSON() {
    return {
      defaultOrg: this.defaultOrg,
      organization: this.organization
    };
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

  toJSON() {
    return {
      identifier: this.identifier,
      title: this.title,
      items: this.items
    };
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

  addNestedItem(identifier, isvisible, identifierref, title) {
    const nestedItem = new Item(identifier, isvisible, identifierref, title);
    this.addItem(nestedItem);
    return nestedItem;
  }

  toJSON() {
    const obj = {
      identifier: this.identifier,
      isvisible: this.isvisible,
      identifierref: this.identifierref,
      title: this.title
    };
    if (this.items.length > 0) {
      obj.items = this.items;
    }
    return obj;
  }
}

class Resources {
  constructor() {
    this.resource = [];
  }

  addResource(resource) {
    this.resource.push(resource);
  }

  toJSON() {
    return {
      resource: this.resource
    };
  }
}

class Resource {
  constructor(identifier, type, href, scormtype) {
    this.identifier = identifier;
    this.type = type;
    this.href = href || "sin valor";
    this.scormtype = scormtype;
  }

  toJSON() {
    return {
      identifier: this.identifier,
      type: this.type,
      href: this.href,
      scormtype: this.scormtype
    };
  }
}

function buildFromXML(xmlString) {
  let xmlResult;
  let jsonManifest
  parseString(xmlString, (err, result) => {
        if (err) {
          console.error('Error al analizar el archivo XML:', err);
          return;
        }
        xmlResult = Manifest.buildFromXML(result);
        jsonManifest = JSON.stringify(xmlResult, null, 2)

      })
      return jsonManifest;
}
module.exports = {
  buildFromXML
};
