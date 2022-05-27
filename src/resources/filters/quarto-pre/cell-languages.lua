-- cell-languages.lua
-- Copyright (C) 2022 by RStudio, PBC

-- handlers process code cells into either a list of inlines or into a list of blocks

function cellLanguageBlocks() 
  return {
    CodeBlock = function(block)
      for _,class in ipairs(block.classes) do
        if string.sub(class, 1, 1) ~= "{" or string.sub(class, -1, -1) ~= "}" then
          goto continue 
          -- my, my, it's 1985 in here. 
          -- ...And goto has an undeserved bad rep
          -- see "what about goto?" in http://iq0.com/notes/deep.nesting.html)
        end
        local lang = string.sub(class, 2, -2)
        local handler = handlerForCellLanguage(lang)
        if handler ~= nil then
          return handler.cell(block)
        end
        ::continue::
      end
      return block
    end,
    Pandoc = function(pandoc)
      return ourPandoc(pandoc)
      -- return localOurPandoc(pandoc) <-- why doesn't this work?
    end
  }
end

local function localOurPandoc(pandoc)
  return pandoc
end

function ourPandoc(pandoc)
  return localOurPandoc(pandoc)
end