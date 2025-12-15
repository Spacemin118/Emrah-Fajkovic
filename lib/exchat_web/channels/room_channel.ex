defmodule ExchatWeb.RoomChannel do
  use ExchatWeb, :channel
  alias ExchatWeb.Presence
  @impl true
  def join("room:42", payload, socket) do
    if authorized?(payload) do
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do

    {:ok, msg} = Exchat.Message.changeset(%Exchat.Message{}, payload) |> Exchat.Repo.insert()
    socket
    |> assign(:username, msg.name)
    |> track_presence()
    |> broadcast("shout", Map.put_new(payload, :id, msg.id))
    {:noreply, socket}
  end

  @impl true
  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{body: body})
    {:noreply, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do

    messages =
      Exchat.Message.get_messages(30)
      |> Enum.reverse()

    payload = Enum.map(messages, fn msg ->
      %{name: msg.name, message: msg.message, inserted_at: msg.inserted_at}
    end)
    # Get messages and list them
#    Exchat.Message.get_messages()
    # reverts the enum to display the latest message at the bottom of the page
#    |> Enum.reverse()
#    |> Enum.each(fn msg ->
#      push(socket, "shout", %{
#        name: msg.name,
#        message: msg.message,
#        inserted_at: msg.inserted_at
#      })
#    end)

    # Send previous messages to the client
    push(socket, "load_messages", %{messages: payload})
    # Send currently online people in room:42
    push(socket, "presence_state", Presence.list("room:42"))

    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end

  # This creates a Presence track when the person joins the channel.
  # Normally this is done when joining the channel,
  # but the socket doesn't know the name so we wait for a message to be sent
  # with the name to begin tracking.
  defp track_presence(%{assigns: %{username: username}} = socket) do
    Presence.track(socket, username, %{
      online_at: inspect(System.system_time(:second))
    })
    socket
  end
end
