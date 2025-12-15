defmodule ExchatWeb.PageController do
  use ExchatWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
