defmodule Exchat.Message do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  schema "messages" do
    field :name, :string
    field :message, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:name, :message])
    |> validate_required([:name, :message])
  end

  def get_messages(limit \\ 30) do
    Exchat.Message
    |> limit(^limit)
    |> order_by(desc: :inserted_at)
    |> Exchat.Repo.all()
  end
end
