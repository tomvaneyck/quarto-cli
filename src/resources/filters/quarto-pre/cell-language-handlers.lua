-- cell-language-handlers.lua
-- Copyright (C) 2022 by RStudio, PBC

-- handlers process code cells into either a list of inlines or into a list of blocks
   
local handlers = {}

function initCellLanguageHandlers()

  -- user provided handlers
  local cellLanguageFiles = pandoc.List(param("cell-languages", {}))
  for cellLanguageName, cellLanguageFile in pairs(cellLanguageFiles) do
    local env = setmetatable({}, {__index = extensionMetatable(cellLanguageFile)})
    local chunk, err = loadfile(cellLanguageFile, "bt", env)
    if not err then
      local result = chunk()
      result["name"] = cellLanguageName
      handlers[cellLanguageName] = result
    else
      error(err)
      os.exit(1)
    end
  end
end

function handlerForCellLanguage(cellLanguage)
  return handlers[cellLanguage]
end

