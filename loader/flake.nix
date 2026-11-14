{
  description = "Loader FastAPI service";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    python = pkgs.python3.withPackages (ps: [
      ps.fastapi
      ps.requests
      ps.uvicorn
    ]);
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = [ python ];
    };

    apps.${system}.default = {
      type = "app";
      program = "${pkgs.writeShellScript "run-loader" ''
        exec ${python}/bin/uvicorn main:app --reload
      ''}";
    };
  };
}
