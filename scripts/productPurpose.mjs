/**
 * Generates a brief purpose explanation for catalog products based on
 * name, description, and category patterns from the price list.
 */
export function resolveProductPurpose({ name, description, categoryId }) {
  const text = `${name} ${description}`.toLowerCase();

  if (/fiber tray/.test(text)) {
    if (/additional cable exit|vertical drop/.test(text)) {
      return 'A fiber tray cable exit accessory provides a controlled vertical drop or exit point from an overhead fiber tray run. It helps guide patch cords and trunk cables into racks or cabinets while maintaining bend radius and protecting splices during the transition.';
    }
    if (/\d+\s*in.*\d+\s*mm.*wide/.test(text)) {
      return 'A sized fiber tray section is a width-specific segment of an overhead fiber pathway used to route, organize, and protect fiber optic cables between racks. It keeps slack and splices contained while maintaining the bend radius required for reliable optical performance.';
    }
    return 'A fiber tray (or fiber optic splice tray) is a protective organizer used to house, route, and safeguard delicate fiber optic splices and excess cable slack. It ensures that fragile connections remain secure and maintains the necessary bend radius to prevent signal loss or breakage.';
  }

  if (/basket tray/.test(text)) {
    if (/additional cable exit|vertical drop/.test(text)) {
      return 'A basket tray cable exit accessory creates a managed vertical transition from an overhead basket tray into equipment rows. It organizes cable drops, reduces strain on conductors, and keeps pathways neat at the point where trunk cabling meets cabinets or racks.';
    }
    if (/divider strip/.test(text)) {
      return 'A basket tray divider strip separates cable bundles within a basket tray pathway. It helps segregate power and data runs, reduces cross-talk or interference, and keeps high-density cable paths organized and easier to maintain.';
    }
    if (/cable dropout kit|water fall dropout/.test(text)) {
      return 'A basket tray dropout kit provides a structured exit point for cables leaving an overhead basket tray. It controls bend radius and routing at the drop location so cables enter racks or cabinets without snagging, kinking, or exceeding minimum bend limits.';
    }
    if (/radt90|radius shield/.test(text)) {
      return 'A basket tray radius shield protects cables at tray bends and transitions. It enforces a controlled bend radius through turns and junctions, reducing the risk of damage to copper conductors and helping maintain cable performance in overhead pathways.';
    }
    if (/\d+\s*in.*\d+\s*mm.*wide/.test(text)) {
      return 'A sized basket tray section is a width-specific segment of an overhead cable basket used to route and support large bundles of copper network cabling. It provides a ventilated, accessible pathway that simplifies adds, moves, and changes in dense data center rows.';
    }
    return 'A basket tray is an overhead cable management pathway used to route, support, and organize copper network cables between racks and cabinets. Its open basket design allows airflow and easy access while keeping high-volume cabling runs structured and serviceable.';
  }

  if (/copper tray/.test(text)) {
    if (/\d+\s*in.*\d+\s*mm.*wide/.test(text)) {
      return 'A sized copper tray section is a width-specific segment of an overhead pathway designed to carry copper data and network cables. It keeps cable bundles supported and separated while providing an accessible route for installation, inspection, and future changes.';
    }
    return 'A copper tray is an overhead cable management system used to route and support copper network cabling across data center rows. It organizes large cable volumes, protects conductors from strain, and keeps pathways accessible for maintenance and expansion.';
  }

  if (/depth extender/.test(text)) {
    return 'A cabinet depth extender increases usable mounting depth inside a server cabinet, allowing deeper equipment or additional cable management space behind racks. It is used when standard cabinet depth is insufficient for modern servers, PDUs, or dense cable routing requirements.';
  }

  if (/^cabinet|cabinet \|/.test(description.toLowerCase()) || name.toLowerCase() === 'cabinet') {
    return 'A data center cabinet (server rack) houses, secures, and organizes IT equipment in a standard rack-mount form factor. It provides structured mounting for servers, switches, and accessories while supporting airflow, cable entry, and physical security within a colocation environment.';
  }

  if (/vertical cable management kit/.test(text)) {
    return 'A vertical cable management kit mounts to the front or rear of a cabinet to organize patch cords and trunk cables along the rack height. Finger ducts and channels keep cabling separated, maintain bend radius, and improve airflow by preventing obstructed cabinet spaces.';
  }

  if (/vertical cable management fingers/.test(text)) {
    return 'Vertical cable management fingers are spaced guides installed along the height of a rack to organize and retain patch cables. They reduce cable congestion, protect bend radius at the rack edge, and make it easier to trace, remove, or replace individual connections.';
  }

  if (/cable management vertical with finger and door/.test(text)) {
    return 'A vertical cable manager with fingers and door combines open finger ducts with a cover to route and protect cables along the cabinet side. The door helps contain cabling for a cleaner appearance while still allowing controlled access for MAC work and troubleshooting.';
  }

  if (/cable finger bracket/.test(text)) {
    return 'Cable finger brackets attach to a rack or cabinet to create defined channels for organizing patch and power cables. They keep cabling aligned during installation, reduce strain on connectors, and help maintain service loops without blocking equipment access.';
  }

  if (/cable guides/.test(text)) {
    return 'Cable guides direct patch and trunk cables along defined paths within or beside a cabinet. They reduce cable crossover, protect connectors from stress, and make it easier to maintain consistent routing as equipment is added or replaced.';
  }

  if (/fixed shelf|shelf/.test(text)) {
    return 'A rack shelf provides a fixed horizontal mounting surface inside a cabinet for equipment that is not rack-ear mountable. It supports items such as small appliances, media converters, or tools while keeping them stable, accessible, and off the data hall floor.';
  }

  if (/ring cable organizer/.test(text)) {
    return 'Ring cable organizers bundle and route groups of cables through circular retention rings mounted in a rack. They keep related cable runs together, reduce tangling, and simplify tracing connections during installation or maintenance.';
  }

  if (/rpdu|r pdu/.test(text)) {
    if (/monitored|metered|switched/.test(text)) {
      return 'A rack PDU (rPDU) distributes conditioned power from a facility feed to multiple outlets within a cabinet. Monitored, metered, and switched models add visibility and control over power consumption and individual outlet states for capacity planning and remote operations.';
    }
    return 'A rack PDU (rPDU) distributes electrical power to multiple devices mounted in a single cabinet. It converts a facility power feed into rack-level outlets for servers, switches, and other equipment while supporting standardized connectors for the target region.';
  }

  if (/updu input cable/.test(text)) {
    return 'A uPDU input cable connects an under-floor or overhead power distribution unit to its upstream power source. It is specified by plug type, amperage, voltage, and length to match regional electrical standards and the physical layout of the data center floor.';
  }

  if (/updu|u pdu/.test(text)) {
    return 'An under-floor or overhead power distribution unit (uPDU) delivers branch power to multiple cabinets from a central floor or ceiling feed. It simplifies power homing in dense layouts and supports scalable power delivery across a cage or suite.';
  }

  if (/standalone media converter/.test(text)) {
    if (/ds3|e3|t1/.test(text)) {
      return 'A standalone media converter transitions between legacy telecom interfaces (such as T1/E1 or DS3/E3) and fiber optic transport. It extends circuit reach across longer distances and integrates older access technologies into modern fiber-based data center networks.';
    }
    return 'A standalone media converter converts signals between copper Ethernet and fiber optic interfaces. It extends network reach beyond copper distance limits, connects equipment with mismatched port types, and enables flexible handoffs in cross-connect and meet-me-room environments.';
  }

  if (/structured cabling/.test(text)) {
    if (/installation|site survey|testing/.test(text)) {
      return 'Structured cabling installation services cover survey, deployment, and certification of copper and fiber plant within a customer environment. This ensures pathways, terminations, and test results meet design specifications before production traffic is placed on the links.';
    }
    if (/fiber|mmf|mpo|strand/.test(text)) {
      return 'Structured fiber cabling components provide high-density optical connectivity between racks, panels, and carrier handoffs. Modules, trunks, and panels organize fiber strands for scalable bandwidth and simplified moves, adds, and changes in cross-connect areas.';
    }
    if (/copper|cat6|port copper/.test(text)) {
      return 'Structured copper cabling components deliver standardized twisted-pair connectivity for network and cross-connect applications. Patch panels, modules, and cable packs organize large port counts and support reliable, testable copper plant in colocation environments.';
    }
    return 'Structured cabling products are standardized connectivity components used to build organized copper and fiber networks within a data center. They simplify patching, testing, and future expansion by providing consistent terminations and pathways between equipment and carriers.';
  }

  const categoryFallback = {
    'cabinet-accessories':
      'This cabinet accessory supports installation, cable management, or equipment mounting within a data center rack. It helps keep deployments organized, serviceable, and aligned with standard rack practices in colocation environments.',
    'power-accessories':
      'This power accessory supports safe electrical distribution and connectivity to equipment within a cabinet or cage. It helps deliver reliable, appropriately rated power for dense IT deployments in a colocation facility.',
    'cross-connect-accessories':
      'This cross-connect accessory supports physical network connectivity between customer equipment, carriers, and cloud on-ramps. It enables structured patching and signal conversion in meet-me-room and cross-connect environments.',
    'cage-accessories':
      'This cage accessory supports overhead or in-cage infrastructure for routing, organizing, or transitioning network cabling. It helps maintain clean pathways and serviceability within a secured colocation cage.',
    'installation-costs':
      'This item covers professional services related to deploying or configuring data center infrastructure. It ensures equipment and cabling are installed to specification and ready for operational use.',
  };

  return categoryFallback[categoryId] ?? 'This accessory supports data center infrastructure deployment, organization, or connectivity within a colocation environment.';
}
