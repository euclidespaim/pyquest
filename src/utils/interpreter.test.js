import { runSimulatedPython, evaluatePythonLocally } from "./interpreter";

describe("Offline Python Interpreter Tests", () => {
  test("Basic assignment and print", () => {
    const code = `
x = 10
y = 20
print(x + y)
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.stdout).toEqual(["30"]);
    expect(res.variables.x).toBe(10);
    expect(res.variables.y).toBe(20);
  });

  test("Conditionals if/elif/else", () => {
    const code = `
temperatura = 38.2
if temperatura >= 37.8:
    status = "Febre"
elif temperatura >= 37.0:
    status = "Subfebril"
else:
    status = "Normal"
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.status).toBe("Febre");
  });

  test("While loop with counter", () => {
    const code = `
contador = 0
soma = 0
while contador < 5:
    soma = soma + contador
    contador = contador + 1
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.contador).toBe(5);
    expect(res.variables.soma).toBe(10); // 0 + 1 + 2 + 3 + 4
  });

  test("For loop with range", () => {
    const code = `
soma = 0
for i in range(1, 4):
    soma = soma + i
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.soma).toBe(6); // 1 + 2 + 3
  });

  test("Lists, appends, and len", () => {
    const code = `
mochila = ["espada"]
mochila.append("escudo")
tamanho = len(mochila)
primeiro = mochila[0]
segundo = mochila[1]
mochila.remove("espada")
tamanho_depois = len(mochila)
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.tamanho).toBe(2);
    expect(res.variables.primeiro).toBe("espada");
    expect(res.variables.segundo).toBe("escudo");
    expect(res.variables.tamanho_depois).toBe(1);
    expect(res.variables.mochila).toEqual(["escudo"]);
  });

  test("Dictionaries and assignments", () => {
    const code = `
jogador = {"nome": "Zelda", "hp": 80}
jogador["hp"] = 90
classe = "Guerreiro"
jogador["classe"] = classe
nome = jogador["nome"]
hp = jogador["hp"]
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.jogador).toEqual({ nome: "Zelda", hp: 90, classe: "Guerreiro" });
    expect(res.variables.nome).toBe("Zelda");
    expect(res.variables.hp).toBe(90);
  });

  test("OOP classes, constructors, methods, and self", () => {
    const code = `
class Heroi:
    def __init__(self, nome, hp):
        self.nome = nome
        self.hp = hp
    def atacar(self):
        return self.nome + " atacou!"

h = Heroi("Aragorn", 100)
nome_heroi = h.nome
hp_heroi = h.hp
msg = h.atacar()
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.nome_heroi).toBe("Aragorn");
    expect(res.variables.hp_heroi).toBe(100);
    expect(res.variables.msg).toBe("Aragorn atacou!");
  });

  test("Try/Except block error handling", () => {
    const code = `
try:
    erro = 10 / 0
    sucesso = True
except:
    erro = 0
    sucesso = False
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0); // error caught in try/except shouldn't bubble up
    expect(res.variables.erro).toBe(0);
    expect(res.variables.sucesso).toBe(false);
  });

  test("VFS, open, read, write, close, and with context", () => {
    const code = `
with open("diario.txt", "w") as f:
    f.write("Loot: 100 ouro")

f2 = open("diario.txt", "r")
conteudo = f2.read()
f2.close()
`;
    const res = runSimulatedPython(code);
    expect(res.errors).toHaveLength(0);
    expect(res.variables.conteudo).toBe("Loot: 100 ouro");
    expect(res.variables.__vfs["diario.txt"]).toBe("Loot: 100 ouro");
  });

  test("Level 26 validator (OOP challenge)", () => {
    const code = `
class Heroi:
    def __init__(self, nome, hp):
        self.nome = nome
        self.hp = hp
    def atacar(self):
        print(self.nome + " atacou!")

h = Heroi("Aragorn", 100)
h.atacar()
`;
    const res = evaluatePythonLocally(26, code);
    expect(res.aprovado).toBe(true);
    expect(res.nota).toBe(100);
  });

  test("Level 30 validator (Files and OOP challenge)", () => {
    const code = `
class Npc:
    def __init__(self, nome, classe):
        self.nome = nome
        self.classe = classe
    def salvar(self):
        with open("npc.txt", "w") as f:
            f.write(self.nome + " - " + self.classe)

npc = Npc("Gimli", "Guerreiro")
npc.salvar()
`;
    const res = evaluatePythonLocally(30, code);
    expect(res.aprovado).toBe(true);
    expect(res.nota).toBe(100);
  });
});
