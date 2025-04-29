// Función para convertir verbo a sustantivo
export function verbToNoun(verb: string): string {
  const commonVerbs: Record<string, string> = {
    create: "creator",
    update: "updater",
    delete: "deleter",
    remove: "remover",
    get: "getter",
    find: "finder",
    search: "searcher",
    authenticate: "authenticator",
    authorize: "authorizer",
    validate: "validator",
    verify: "verifier",
    process: "processor",
    analyze: "analyzer",
    transform: "transformer",
    convert: "converter",
    manage: "manager",
    handle: "handler",
    execute: "executor",
    implement: "implementer",
    calculate: "calculator",
    compute: "computer",
    generate: "generator",
    modify: "modifier",
    notify: "notifier",
    observe: "observer",
    publish: "publisher",
    subscribe: "subscriber",
    send: "sender",
    receive: "receiver",
  };

  const verb_clean = verb.toLowerCase().trim();
  return commonVerbs[verb_clean] || `${verb_clean}r`; // Por defecto añadimos 'r' si no está en el mapa
}

// Utilidad para capitalizar el nombre del use case
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
