# Exchat

To start your Phoenix server:

* Run `mix setup` to install and setup dependencies
* Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

# Special Guide for Elixir / Phoenix beginners

>> Create Project & Database
* Run mix phx.new projectName // In this project I named project by exchat
* Run mix ecto.create // Create database, you can find repo.ex in lib/exchat
* Run mix phx.gen.schema Message messages name:string email:string // create Table
* Run mix ecto.migrate      // Present your change to the table.
You can check the schema by 'qsql -U postgres' command.

>> Create Socket & Channel
* Run mix phx.gen.socket User   // Create user socket. You can find 'user_socket.js' in 'assets/js/' and also find 'user_socket.ex' in 'lib/exchat_web/channels/'.
* Run mix phx.gen.channel Room  // Create your channel
* Run mix phx.gem.presence  //  Create Phoenix presence that allows you to register process information on a topic and replicate it across to the cluster.


## Learn more

* Official website: https://www.phoenixframework.org/
* Guides: https://hexdocs.pm/phoenix/overview.html
* Docs: https://hexdocs.pm/phoenix
* Forum: https://elixirforum.com/c/phoenix-forum
* Source: https://github.com/phoenixframework/phoenix
