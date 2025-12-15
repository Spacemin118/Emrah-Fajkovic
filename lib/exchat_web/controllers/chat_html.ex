defmodule ExchatWeb.ChatHTML do
  @moduledoc """
  This module contains pages rendered by PageController.

  See the `page_html` directory for all templates available.
  """
  use ExchatWeb, :html

  embed_templates "chat_html/*"

  def person_name(person) do
    person.givenName || person.name || "guest"
  end
end
