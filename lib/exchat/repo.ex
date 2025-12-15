defmodule Exchat.Repo do
  use Ecto.Repo,
    otp_app: :exchat,
    adapter: Ecto.Adapters.Postgres
end
